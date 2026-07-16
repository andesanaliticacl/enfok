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
import type { GoalInput } from '@/lib/planning/goalEngine'
import type { Goal, MissionLocation, Priority, RegionId } from '@/types'

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
  locationQuery: '',
  location: undefined as MissionLocation | undefined,
}

export function GoalFormDialog({ open, onClose, defaultRegionId, goal, onSubmit, onDelete }: GoalFormDialogProps) {
  const regions = useGameStore((s) => s.regions)
  const [regionId, setRegionId] = useState<RegionId>(defaultRegionId)
  const [form, setForm] = useState(EMPTY_FORM)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)

  const { isLoaded: mapsLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY ?? '' })

  useEffect(() => {
    if (!open) return
    setGeocodeError(null)
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
        locationQuery: goal.location?.address ?? '',
        location: goal.location,
      })
    } else {
      setRegionId(defaultRegionId)
      setForm(EMPTY_FORM)
    }
  }, [open, goal, defaultRegionId])

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
      location: form.location,
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
            XP al completar
            <Input
              type="number"
              placeholder="XP"
              className="mt-1"
              value={form.xpReward}
              onChange={(e) => setForm((f) => ({ ...f, xpReward: Number(e.target.value) }))}
            />
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
