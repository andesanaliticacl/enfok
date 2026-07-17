import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { REGION_CATEGORIES } from '@/data/regionCategories'
import { cn } from '@/lib/utils'
import type { RegionInput } from '@/store/useGameStore'
import type { Region, RegionCategory } from '@/types'

interface RegionFormDialogProps {
  open: boolean
  onClose: () => void
  /** Present when editing an existing region. */
  region?: Region
  onSubmit: (input: RegionInput) => void
  /** Editing only — deletes the region and everything inside it. */
  onDelete?: () => void
  goalCount?: number
}

export function RegionFormDialog({ open, onClose, region, onSubmit, onDelete, goalCount = 0 }: RegionFormDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<RegionCategory>('casa')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(region?.name ?? '')
    setCategory(region?.category ?? 'casa')
    setConfirmDelete(false)
  }, [open, region])

  function handleSubmit() {
    if (!name.trim()) return
    onSubmit({ name: name.trim(), category })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={region ? 'Editar región' : 'Nueva región'}>
      <div className="flex flex-col gap-4">
        {!region && (
          <p className="text-[11px] leading-relaxed text-ink-400">
            Una región es un lugar real de tu vida — tu casa, tu gimnasio, tu banco. Ahí es donde nacen tus metas y
            misiones.
          </p>
        )}

        <Input
          placeholder="Nombre (ej. Mi casa, Gimnasio Pacific)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <div>
          <p className="mb-1.5 text-xs text-ink-400">Tipo de lugar</p>
          <div className="grid grid-cols-4 gap-2">
            {REGION_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border border-ink-700 bg-ink-900 p-2.5',
                  category === c.id && 'border-gold-400',
                )}
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-[10px] text-ink-200">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {region ? 'Guardar cambios' : 'Crear región'}
        </Button>

        {region && onDelete && (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-3">
            {!confirmDelete ? (
              <Button
                variant="outline"
                size="sm"
                className="border-red-800 text-red-300"
                onClick={() => setConfirmDelete(true)}
              >
                Eliminar región
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-red-300">
                  Se eliminará la región{goalCount > 0 ? ` junto a sus ${goalCount} meta${goalCount === 1 ? '' : 's'} y todas sus misiones` : ''}. Esto no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-800 text-red-300"
                    onClick={() => {
                      onDelete()
                      onClose()
                    }}
                  >
                    Sí, eliminar todo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  )
}
