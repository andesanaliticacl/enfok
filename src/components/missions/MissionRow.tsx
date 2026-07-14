import { motion } from 'framer-motion'
import { Check, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

interface MissionRowProps {
  mission: Mission
  onComplete: (id: string) => void
  onEdit?: (mission: Mission) => void
}

const REPEAT_LABEL: Record<Mission['repeat'], string> = {
  ninguna: 'Única',
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
  personalizada: 'Personalizada',
}

export function MissionRow({ mission, onComplete, onEdit }: MissionRowProps) {
  const done = mission.status === 'completada'

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3',
        done && 'opacity-50',
      )}
    >
      <button
        onClick={() => !done && onComplete(mission.id)}
        disabled={done}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink-600 transition-colors',
          done && 'border-gold-500 bg-gold-500 text-ink-950',
        )}
      >
        {done && <Check size={14} strokeWidth={3} />}
      </button>

      <button
        className="flex-1 text-left"
        onClick={() => onEdit?.(mission)}
        disabled={!onEdit}
      >
        <p className={cn('text-sm font-medium text-ink-50', done && 'line-through')}>
          {mission.title}
        </p>
        <p className="text-[11px] text-ink-400">
          {mission.date}
          {mission.time ? ` · ${mission.time}` : ''} · {REPEAT_LABEL[mission.repeat]}
        </p>
      </button>

      <div className="flex items-center gap-2">
        <p className="font-pixel text-[10px] text-gold-400">+{mission.xp} XP</p>
        {onEdit && (
          <button onClick={() => onEdit(mission)} className="text-ink-400 hover:text-ink-50">
            <Pencil size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
