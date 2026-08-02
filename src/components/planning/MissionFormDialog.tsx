import { useEffect, useState } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { MapPin, X } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/useGameStore'
import { GOOGLE_MAPS_API_KEY, geocodeAddress } from '@/lib/world/geocode'
import { PLAYER_STATS, statForRegionCategory } from '@/data/playerStats'
import { cn } from '@/lib/utils'
import type { MissionInput } from '@/lib/planning/missionEngine'
import type { Mission, MissionLocation, MissionRepeat, PlayerStatKey, Priority } from '@/types'

const DIFFICULTY_PRESETS = [
  { id: 'facil', label: 'Fácil', icon: '🟢', xp: 10, coins: 2 },
  { id: 'media', label: 'Media', icon: '🟡', xp: 20, coins: 5 },
  { id: 'dificil', label: 'Difícil', icon: '🔴', xp: 40, coins: 10 },
] as const
type Difficulty = (typeof DIFFICULTY_PRESETS)[number]['id']

function difficultyFor(xp: number): Difficulty {
  return DIFFICULTY_PRESETS.reduce((closest, p) => (Math.abs(p.xp - xp) < Math.abs(closest.xp - xp) ? p : closest)).id
}

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
    difficulty: 'media' as Difficulty,
    estimatedMinutes: '',
    statFocus: undefined as PlayerStatKey | undefined,
    repeat: 'ninguna' as MissionRepeat,
    locationQuery: '',
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
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { isLoaded: mapsLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? '' })

  useEffect(() => {
    if (!open) return
    setGeocodeError(null)
    setConfirmDelete(false)
    if (mission) {
      setForm({
        goalId: mission.goalId,
        title: mission.title,
        description: mission.description,
        date: mission.date,
        time: mission.time ?? '',
        priority: mission.priority,
        difficulty: difficultyFor(mission.xp),
        estimatedMinutes: mission.estimatedMinutes ? String(mission.estimatedMinutes) : '',
        statFocus: mission.statFocus,
        repeat: mission.repeat,
        locationQuery: mission.location?.address ?? '',
        location: mission.location,
      })
    } else {
      setForm(emptyForm(defaultGoalId, defaultDate))
    }
  }, [open, mission, defaultGoalId, defaultDate])

  // The region a mission's goal lives in — what "Automático" would pick for the attribute.
  const selectedGoal = goals.find((g) => g.id === form.goalId)
  const selectedRegion = selectedGoal ? regions.find((r) => r.id === selectedGoal.regionId) : undefined
  const autoStat = selectedRegion ? statForRegionCategory(selectedRegion.category) : undefined

  function handleAddressChange(value: string) {
    setGeocodeError(null)
    setForm((f) => ({ ...f, locationQuery: value, location: undefined }))
  }

  async function handleGeocode() {
    if (!form.locationQuery.trim()) return
    setGeocoding(true)
    setGeocodeError(null)
    try {
      const result = await geocodeAddress(form.locationQuery.trim())
      if (!result) {
        setGeocodeError('No encontramos esa dirección. Probá con más detalle (calle, ciudad, país).')
        return
      }
      setForm((f) => ({ ...f, locationQuery: result.address, location: result }))
    } finally {
      setGeocoding(false)
    }
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.goalId || !form.date) return
    const preset = DIFFICULTY_PRESETS.find((p) => p.id === form.difficulty)!
    onSubmit({
      goalId: form.goalId,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      time: form.time || undefined,
      priority: form.priority,
      xp: preset.xp,
      coins: preset.coins,
      estimatedMinutes: form.estimatedMinutes ? Math.max(0, Number(form.estimatedMinutes)) : undefined,
      tags: mission?.tags ?? [],
      statFocus: form.statFocus,
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

        <Select value={form.goalId} onChange={(e) => setForm((f) => ({ ...f, goalId: e.target.value }))}>
          <option value="" disabled>
            Selecciona una meta
          </option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.icon} {g.name}
            </option>
          ))}
        </Select>

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

        {/* Difficulty is the only lever now — XP and coins are always exactly what the preset says, never hand-typed. */}
        <div>
          <label className="mb-1.5 block text-xs text-ink-400">
            Dificultad <span className="text-ink-600">(fija la XP y monedas al completar)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_PRESETS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, difficulty: d.id }))}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl border border-ink-600 bg-ink-900 py-2 text-xs text-ink-200',
                  form.difficulty === d.id && 'border-gold-400 bg-gold-500/10 text-gold-400',
                )}
              >
                <span>{d.icon} {d.label}</span>
                <span className="text-[10px] text-ink-500">{d.xp} XP · {d.coins}🪙</span>
              </button>
            ))}
          </div>
        </div>

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

        {/* Which stat this mission trains — invisible to the reward the player sees, it just nudges the dashboard. */}
        <div>
          <label className="mb-1.5 block text-xs text-ink-400">Atributo que entrena</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, statFocus: undefined }))}
              className={cn(
                'rounded-full border border-ink-600 px-2.5 py-1 text-[11px] text-ink-300',
                form.statFocus === undefined && 'border-gold-400 bg-gold-500/20 text-gold-400',
              )}
              title={autoStat ? `Según la región de la meta: ${PLAYER_STATS.find((s) => s.key === autoStat)?.label}` : 'Según la región de la meta'}
            >
              ✨ Automático
            </button>
            {PLAYER_STATS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, statFocus: s.key }))}
                className={cn(
                  'rounded-full border border-ink-600 px-2.5 py-1 text-[11px] text-ink-300',
                  form.statFocus === s.key && 'border-gold-400 bg-gold-500/20 text-gold-400',
                )}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-ink-400">Ubicación (opcional)</label>
          <div className="flex gap-2">
            <Input
              placeholder="Dirección (ej. Av. Providencia 123, Santiago)"
              value={form.locationQuery}
              onChange={(e) => handleAddressChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleGeocode()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGeocode}
              disabled={!GOOGLE_MAPS_API_KEY || !mapsLoaded || geocoding || !form.locationQuery.trim()}
            >
              <MapPin size={14} />
            </Button>
          </div>

          {!GOOGLE_MAPS_API_KEY && (
            <p className="text-[11px] text-ink-500">Configura VITE_GOOGLE_MAPS_API_KEY para ubicar direcciones.</p>
          )}
          {geocoding && <p className="text-[11px] text-ink-400">Buscando dirección...</p>}
          {geocodeError && <p className="text-[11px] text-red-400">{geocodeError}</p>}
          {form.location && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-ink-700 bg-ink-800/50 px-2.5 py-1.5">
              <p className="truncate text-[11px] text-emerald-400">
                📍 {form.location.address} ({form.location.lat.toFixed(5)}, {form.location.lng.toFixed(5)})
              </p>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, location: undefined, locationQuery: '' }))}
                className="shrink-0 text-ink-400 hover:text-ink-50"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

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
