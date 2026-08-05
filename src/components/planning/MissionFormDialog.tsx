import { useEffect, useState } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { X, ChevronDown } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/useGameStore'
import { GOOGLE_MAPS_API_KEY } from '@/lib/world/geocode'
import { LocationSearch } from '@/components/world/LocationSearch'
import { rollMissionReward } from '@/lib/planning/missionEngine'
import { statForRegionCategory, playerStatDef } from '@/data/playerStats'
import { cn } from '@/lib/utils'
import type { MissionInput } from '@/lib/planning/missionEngine'
import type { Mission, MissionLocation, MissionRepeat, Priority } from '@/types'

interface MissionFormDialogProps {
  open: boolean
  onClose: () => void
  defaultGoalId?: string
  defaultDate?: string
  mission?: Mission
  onSubmit: (input: MissionInput) => void
  onDelete?: () => void
}

function emptyForm(defaultGoalId?: string, defaultDate?: string) {
  return {
    goalId: defaultGoalId ?? '',
    title: '',
    description: '',
    date: defaultDate ?? new Date().toISOString().slice(0, 10),
    time: '',
    priority: 'media' as Priority,
    estimatedMinutes: '',
    repeat: 'ninguna' as MissionRepeat,
    location: undefined as MissionLocation | undefined,
  }
}

export function MissionFormDialog({
  open,
  onClose,
  defaultGoalId,
  defaultDate,
  mission,
  onSubmit,
  onDelete,
}: MissionFormDialogProps) {
  const goals = useGameStore((s) => s.goals)
  const regions = useGameStore((s) => s.regions)
  const [form, setForm] = useState(emptyForm(defaultGoalId, defaultDate))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showExtras, setShowExtras] = useState(false)

  const { isLoaded: mapsLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? '' })

  useEffect(() => {
    if (!open) return
    setConfirmDelete(false)
    setShowExtras(false)
    if (mission) {
      setForm({
        goalId: mission.goalId,
        title: mission.title,
        description: mission.description,
        date: mission.date,
        time: mission.time ?? '',
        priority: mission.priority,
        estimatedMinutes: mission.estimatedMinutes ? String(mission.estimatedMinutes) : '',
        repeat: mission.repeat,
        location: mission.location,
      })
    } else {
      // With a single goal there's nothing to choose — adopt it silently.
      setForm(emptyForm(defaultGoalId ?? (goals.length === 1 ? goals[0].id : undefined), defaultDate))
    }
  }, [open, mission, defaultGoalId, defaultDate, goals])

  const selectedGoal = goals.find((g) => g.id === form.goalId)
  const selectedRegion = selectedGoal ? regions.find((r) => r.id === selectedGoal.regionId) : undefined
  // The attribute is inferred from where the goal lives, so it never has to be asked.
  const trainedStat = selectedRegion ? playerStatDef(statForRegionCategory(selectedRegion.category)) : undefined

  // Only ask which goal when it can't be inferred from context. Based on the
  // props rather than the current value, or the picker would vanish the moment
  // you used it.
  const mustPickGoal = !mission && !defaultGoalId && goals.length > 1

  function handleSubmit() {
    if (!form.title.trim() || !form.goalId || !form.date) return
    // Editing keeps the reward it was born with; only new missions roll.
    const reward = mission ? { xp: mission.xp, coins: mission.coins } : rollMissionReward()
    onSubmit({
      goalId: form.goalId,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      time: form.time || undefined,
      priority: form.priority,
      xp: reward.xp,
      coins: reward.coins,
      estimatedMinutes: form.estimatedMinutes ? Math.max(0, Number(form.estimatedMinutes)) : undefined,
      tags: mission?.tags ?? [],
      // Left undefined on purpose: the store falls back to the goal's region.
      statFocus: undefined,
      repeat: form.repeat,
      location: form.location,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={mission ? 'Editar misión' : 'Nueva misión'}>
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Nombre de la misión"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          autoFocus
        />
        <Textarea
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        {mustPickGoal && (
          <Select value={form.goalId} onChange={(e) => setForm((f) => ({ ...f, goalId: e.target.value }))}>
            <option value="" disabled>
              ¿A qué meta pertenece?
            </option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.icon} {g.name}
              </option>
            ))}
          </Select>
        )}

        {selectedGoal && (
          <p className="-mt-1 text-[11px] text-ink-500">
            Suma a la meta <span className="text-ink-300">{selectedGoal.icon} {selectedGoal.name}</span>
            {trainedStat && (
              <>
                {' · entrena '}
                <span className="text-ink-300">
                  {trainedStat.icon} {trainedStat.label}
                </span>
              </>
            )}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-400">
            Fecha *
            <Input
              type="date"
              required
              className="mt-1"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </label>
          <label className="text-xs text-ink-400">
            Hora (opcional)
            <Input
              type="time"
              className="mt-1"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
          >
            <option value="baja">Prioridad baja</option>
            <option value="media">Prioridad media</option>
            <option value="alta">Prioridad alta</option>
          </Select>
          <Select value={form.repeat} onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.value as MissionRepeat }))}>
            <option value="ninguna">No se repite</option>
            <option value="diaria">Diaria</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
            <option value="personalizada">Personalizada</option>
          </Select>
        </div>

        {/* Everything below is optional — folded away so the common case is four fields */}
        <button
          type="button"
          onClick={() => setShowExtras((v) => !v)}
          className="flex items-center gap-1 self-start text-[11px] text-ink-400 hover:text-gold-400"
        >
          <ChevronDown size={13} className={cn('transition-transform', showExtras && 'rotate-180')} />
          {showExtras ? 'Menos opciones' : 'Más opciones'}
        </button>

        {showExtras && (
          <>
            <label className="text-xs text-ink-400">
              Duración estimada (opcional)
              <Input
                type="number"
                placeholder="Minutos"
                className="mt-1"
                value={form.estimatedMinutes}
                onChange={(e) => setForm((f) => ({ ...f, estimatedMinutes: e.target.value }))}
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-ink-400">
                Ubicación distinta a la de su región (opcional)
              </label>
              <LocationSearch
                mapsLoaded={mapsLoaded}
                placeholder="Buscar dirección o lugar..."
                onSelect={(result) => setForm((f) => ({ ...f, location: result }))}
              />
              {form.location && (
                <div className="flex items-center justify-between gap-2 rounded-lg border border-ink-700 bg-ink-800/50 px-2.5 py-1.5">
                  <p className="truncate text-[11px] text-emerald-400">📍 {form.location.address}</p>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, location: undefined }))}
                    className="shrink-0 text-ink-400 hover:text-ink-50"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-2 flex gap-3">
          {mission && onDelete && (
            <Button
              variant="outline"
              className={confirmDelete ? 'border-red-700 text-red-300' : undefined}
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true)
                  return
                }
                onDelete()
                onClose()
              }}
              onBlur={() => setConfirmDelete(false)}
            >
              {confirmDelete ? '¿Seguro? Sí, eliminar' : 'Eliminar'}
            </Button>
          )}
          <Button onClick={handleSubmit} className="flex-1">
            {mission ? 'Guardar cambios' : 'Crear misión'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
