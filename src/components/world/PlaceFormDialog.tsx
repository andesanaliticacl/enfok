import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PLACE_CATEGORIES } from '@/data/placeCategories'
import { cn } from '@/lib/utils'
import type { PlaceCategory } from '@/types'

interface PlaceFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (name: string, category: PlaceCategory) => void
}

export function PlaceFormDialog({ open, onClose, onSubmit }: PlaceFormDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<PlaceCategory>('casa')

  function handleSubmit() {
    if (!name.trim()) return
    onSubmit(name.trim(), category)
    setName('')
    setCategory('casa')
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nuevo lugar">
      <div className="flex flex-col gap-4">
        <Input placeholder="Nombre (ej. Mi casa)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

        <div className="grid grid-cols-3 gap-2">
          {PLACE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border border-ink-700 bg-ink-900 p-3',
                category === c.id && 'border-gold-400',
              )}
            >
              <span className="text-xl">{c.icon}</span>
              <span className="text-[10px] text-ink-200">{c.label}</span>
            </button>
          ))}
        </div>

        <Button onClick={handleSubmit}>Guardar lugar</Button>
      </div>
    </Dialog>
  )
}
