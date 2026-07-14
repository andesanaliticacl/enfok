import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/useGameStore'
import type { MissionInput } from '@/lib/planning/missionEngine'
import type { Mission, MissionRepeat, Priority } from '@/types'

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
    xp: 20,
    coins: 5,
    estimatedMinutes: '',
    tags: '',
    repeat: 'ninguna' as MissionRepeat,
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
  const [form, setForm] = useState(emptyForm(defaultGoalId, defaultDate))

  useEffect(() => {
    if (!open) return
    if (mission) {
      setForm({
        goalId: mission.goalId,
        title: mission.title,
        description: mission.description,
        date: mission.date,
        time: mission.time ?? '',
        priority: mission.priority,
        xp: mission.xp,
        coins: mission.coins,
        estimatedMinutes: mission.estimatedMinutes ? String(mission.estimatedMinutes) : '',
        tags: mission.tags.join(', '),
        repeat: mission.repeat,
      })
    } else {
      setForm(emptyForm(defaultGoalId, defaultDate))
    }
  }, [open, mission, defaultGoalId, defaultDate])

  function handleSubmit() {
    if (!form.title.trim() || !form.goalId || !form.date) return
    onSubmit({
      goalId: form.goalId,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      time: form.time || undefined,
      priority: form.priority,
      xp: Number(form.xp) || 0,
      coins: Number(form.coins) || 0,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      repeat: form.repeat,
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

        <div className="grid grid-cols-3 gap-3">
          <Input
            type="number"
            placeholder="XP"
            value={form.xp}
            onChange={(e) => setForm((f) => ({ ...f, xp: Number(e.target.value) }))}
          />
          <Input
            type="number"
            placeholder="Monedas"
            value={form.coins}
            onChange={(e) => setForm((f) => ({ ...f, coins: Number(e.target.value) }))}
          />
          <Input
            type="number"
            placeholder="Minutos"
            value={form.estimatedMinutes}
            onChange={(e) => setForm((f) => ({ ...f, estimatedMinutes: e.target.value }))}
          />
        </div>

        <Input
          placeholder="Etiquetas separadas por coma"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
        />

        <div className="mt-2 flex gap-3">
          {mission && onDelete && (
            <Button
              variant="outline"
              onClick={() => {
                onDelete()
                onClose()
              }}
            >
              Eliminar
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
