import { useEffect, useRef, useState } from 'react'
import { Trash2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDeleteButtonProps {
  onConfirm: () => void
  /** Icon size in px for both the trigger and the confirm/cancel icons. */
  size?: number
  className?: string
  title?: string
  /** Use a plain "×" close icon instead of the trash can — for spots (ranking rows) where a trash can reads as "delete the whole thing" rather than "remove this entry". */
  variant?: 'trash' | 'close'
}

/**
 * A delete trigger that always asks first: one tap arms it (swaps to a
 * check/cancel pair with a "¿Seguro?" label), a second tap on the check
 * actually deletes. Tapping anywhere else, or waiting a few seconds, disarms
 * it — so nothing destructive ever fires from a single accidental tap.
 */
export function ConfirmDeleteButton({ onConfirm, size = 14, className, title, variant = 'trash' }: ConfirmDeleteButtonProps) {
  const [armed, setArmed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!armed) return
    timerRef.current = setTimeout(() => setArmed(false), 4000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [armed])

  if (armed) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[10px] text-red-300">¿Seguro?</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setArmed(false)
            onConfirm()
          }}
          title="Sí, eliminar"
          className="text-red-400 hover:text-red-300"
        >
          <Check size={size} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setArmed(false)
          }}
          title="Cancelar"
          className="text-ink-500 hover:text-ink-300"
        >
          <X size={size} />
        </button>
      </span>
    )
  }

  const Icon = variant === 'trash' ? Trash2 : X
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setArmed(true)
      }}
      title={title ?? 'Eliminar'}
      className={cn('text-ink-500 hover:text-red-400', className)}
    >
      <Icon size={size} />
    </button>
  )
}
