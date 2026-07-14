import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/useGameStore'
import type { GoalInput } from '@/lib/planning/goalEngine'
import type { Goal, Priority, RegionId } from '@/types'

interface GoalFormDialogProps {
  open: boolean
  onClose: () => void
  defaultRegionId: RegionId
  goal?: Goal
  onSubmit: (input: GoalInput) => void
  onDelete?: () => void
}

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  startDate: '',
  dueDate: '',
  priority: 'media' as Priority,
  xpReward: 50,
  reward: '',
  icon: '⭐',
}

export function GoalFormDialog({ open, onClose, defaultRegionId, goal, onSubmit, onDelete }: GoalFormDialogProps) {
  const regions = useGameStore((s) => s.regions)
  const [regionId, setRegionId] = useState<RegionId>(defaultRegionId)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    if (goal) {
      setRegionId(goal.regionId)
      setForm({
        name: goal.name,
        description: goal.description,
        category: goal.category,
        startDate: goal.startDate ?? '',
        dueDate: goal.dueDate ?? '',
        priority: goal.priority,
        xpReward: goal.xpReward,
        reward: goal.reward ?? '',
        icon: goal.icon,
      })
    } else {
      setRegionId(defaultRegionId)
      setForm(EMPTY_FORM)
    }
  }, [open, goal, defaultRegionId])

  function handleSubmit() {
    if (!form.name.trim()) return
    const region = regions.find((r) => r.id === regionId)!
    onSubmit({
      regionId,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'Meta',
      startDate: form.startDate || undefined,
      dueDate: form.dueDate || undefined,
      priority: form.priority,
      xpReward: Number(form.xpReward) || 0,
      reward: form.reward.trim() || undefined,
      color: region.color,
      icon: form.icon || region.emoji,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={goal ? 'Editar meta' : 'Nueva meta'}>
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Nombre de la meta"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          autoFocus
        />
        <Textarea
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select value={regionId} onChange={(e) => setRegionId(e.target.value as RegionId)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.emoji} {r.name}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Categoría (Hábito, Proyecto...)"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-400">
            Fecha de inicio
            <Input
              type="date"
              className="mt-1"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </label>
          <label className="text-xs text-ink-400">
            Fecha objetivo
            <Input
              type="date"
              className="mt-1"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Select
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </Select>
          <Input
            type="number"
            placeholder="XP"
            value={form.xpReward}
            onChange={(e) => setForm((f) => ({ ...f, xpReward: Number(e.target.value) }))}
          />
          <Input
            placeholder="Icono"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          />
        </div>

        <Input
          placeholder="Recompensa personal (opcional)"
          value={form.reward}
          onChange={(e) => setForm((f) => ({ ...f, reward: e.target.value }))}
        />

        <div className="mt-2 flex gap-3">
          {goal && onDelete && (
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
            {goal ? 'Guardar cambios' : 'Crear meta'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
