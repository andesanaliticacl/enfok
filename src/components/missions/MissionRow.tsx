import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

interface MissionRowProps {
  mission: Mission
  onComplete: (id: string) => void
}

const FREQUENCY_LABEL: Record<Mission['frequency'], string> = {
  unica: 'Única',
  repetitiva: 'Repetitiva',
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
  flexible: 'Flexible',
}

export function MissionRow({ mission, onComplete }: MissionRowProps) {
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

      <div className="flex-1">
        <p className={cn('text-sm font-medium text-ink-50', done && 'line-through')}>
          {mission.title}
        </p>
        <p className="text-[11px] text-ink-400">{FREQUENCY_LABEL[mission.frequency]}</p>
      </div>

      <div className="text-right">
        <p className="font-pixel text-[10px] text-gold-400">+{mission.xp} XP</p>
      </div>
    </motion.div>
  )
}
