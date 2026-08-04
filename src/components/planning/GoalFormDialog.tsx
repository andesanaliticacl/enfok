import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store/useGameStore'
import { cn } from '@/lib/utils'

import type { GoalInput } from '@/lib/planning/goalEngine'
import type { Goal, MissionLocation, Priority, RegionId } from '@/types'

/** Three sizes of ambition. The XP is a consequence of the size, not a field to fill in. */
const GOAL_TIERS = [
  { id: 'pequena', label: 'Pequeña', icon: '🌱', hint: 'Semanas', xp: 100 },
  { id: 'mediana', label: 'Mediana', icon: '🌿', hint: 'Un par de meses', xp: 250 },
  { id: 'grande', label: 'Grande', icon: '🌳', hint: 'Cambia tu año', xp: 500 },
] as const

interface GoalFormDialogProps {
  open: boolean
  onClose: () => void
  /** May be missing when the player hasn't created any region yet. */
  defaultRegionId?: RegionId
  goal?: Goal
  onSubmit: (input: GoalInput) => void
  onDelete?: () => void
}

const EMPTY_FORM = {
  name: '',
  description: '',
  /** Fijo: la categoría libre no aportaba sobre la región + el nivel. */
  category: 'Meta',
  startDate: '',
  dueDate: '',
  priority: 'media' as Priority,
  xpReward: 250,
  reward: '',
  icon: '⭐',
  location: undefined as MissionLocation | undefined,
}

export function GoalFormDialog({ open, onClose, defaultRegionId, goal, onSubmit, onDelete }: GoalFormDialogProps) {
  const navigate = useNavigate()
  const regions = useGameStore((s) => s.regions)
  const [regionId, setRegionId] = useState<RegionId>(defaultRegionId ?? '')
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selectedRegion = regions.find((r) => r.id === regionId)

  useEffect(() => {
    if (!open) return
    setConfirmDelete(false)
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
        location: goal.location,
      })
    } else {
      setRegionId(defaultRegionId ?? '')
      setForm(EMPTY_FORM)
    }
  }, [open, goal, defaultRegionId])

  function handleSubmit() {
    if (!form.name.trim()) return
    const region = regions.find((r) => r.id === regionId)
    if (!region) return
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
      location: form.location,
    })
    onClose()
  }

  if (regions.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} title="Nueva meta">
        <div className="flex flex-col gap-3 text-center">
          <span className="text-3xl">🗺️</span>
          <p className="text-sm leading-relaxed text-ink-300">
            Las metas viven en una región — un lugar real de tu vida como tu casa, gimnasio o banco. Crea tu primera
            región en el mapa y vuelve aquí.
          </p>
          <Button
            onClick={() => {
              onClose()
              navigate('/mundo')
            }}
          >
            Ir al mapa a crear mi región
          </Button>
        </div>
      </Dialog>
    )
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

        {/* The region IS the goal's place — a separate address field would be the same
            answer asked twice, so the region's own location is shown instead. */}
        <label className="text-xs text-ink-400">
          ¿Dónde ocurre?
          <Select className="mt-1" value={regionId} onChange={(e) => setRegionId(e.target.value as RegionId)}>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.emoji} {r.name}
              </option>
            ))}
          </Select>
        </label>
        {selectedRegion && (
          <p className="-mt-1.5 text-[11px] text-ink-500">
            {selectedRegion.lat != null && selectedRegion.lng != null
              ? `📍 Usa la ubicación de ${selectedRegion.name} en el mapa.`
              : `Esta región aún no tiene punto en el mapa. Puedes ubicarla desde Mundo.`}
          </p>
        )}

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

        {/* Ambition, not a number: each tier is a different size of life change,
            and the XP it's worth follows from that. */}
        <div>
          <label className="mb-1.5 block text-xs text-ink-400">¿Qué tan grande es?</label>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_TIERS.map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, xpReward: tier.xp }))}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl border border-ink-600 bg-ink-900 py-2 text-xs text-ink-200',
                  form.xpReward === tier.xp && 'border-gold-400 bg-gold-500/10 text-gold-400',
                )}
              >
                <span>{tier.icon} {tier.label}</span>
                <span className="text-[10px] text-ink-500">{tier.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-ink-400">
            Prioridad
            <Select
              className="mt-1"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </Select>
          </label>
          <label className="text-xs text-ink-400">
            Ícono
            <Input
              placeholder="Icono"
              className="mt-1"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            />
          </label>
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
            {goal ? 'Guardar cambios' : 'Crear meta'}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
