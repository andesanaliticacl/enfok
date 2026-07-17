import { motion } from 'framer-motion'
import { Check, Pencil, Repeat, CalendarArrowDown } from 'lucide-react'
import { diffDays, todayKey } from '@/lib/calendar'
import { isDoneForNow, isRepeating } from '@/lib/planning/missionEngine'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

interface MissionRowProps {
  mission: Mission
  onComplete: (id: string) => void
  onEdit?: (mission: Mission) => void
  /** Shown on overdue missions as a one-tap reschedule. */
  onMoveToToday?: (id: string) => void
}

const REPEAT_LABEL: Record<Mission['repeat'], string> = {
  ninguna: 'Única',
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
  personalizada: 'Personalizada',
}

function dateLabel(mission: Mission, today: string): { text: string; overdue: boolean } {
  if (mission.status === 'completada') return { text: mission.date, overdue: false }
  const delta = diffDays(today, mission.date)
  if (delta < 0) return { text: `Vencida hace ${-delta} día${delta === -1 ? '' : 's'}`, overdue: true }
  if (delta === 0) return { text: 'Hoy', overdue: false }
  if (delta === 1) return { text: 'Mañana', overdue: false }
  return { text: mission.date, overdue: false }
}

export function MissionRow({ mission, onComplete, onEdit, onMoveToToday }: MissionRowProps) {
  const today = todayKey()
  const done = isDoneForNow(mission, today)
  const repeating = isRepeating(mission)
  // A repeating mission that's "done" is just resting until its next date —
  // but only show the check if it was actually completed at some point; a
  // never-touched future occurrence is merely scheduled, not achieved.
  const doneForCycle = done && repeating && mission.status !== 'completada'
  const checked = mission.status === 'completada' || (doneForCycle && !!mission.lastCompletedOn)
  const { text, overdue } = dateLabel(mission, today)

  return (
    <motion.div
      layout
      className={cn(
        'flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3',
        done && 'opacity-50',
        overdue && 'border-red-900/70',
      )}
    >
      <button
        onClick={() => !done && onComplete(mission.id)}
        disabled={done}
        title={
          doneForCycle
            ? mission.lastCompletedOn
              ? `Hecha por ahora — vuelve el ${mission.date}`
              : `Programada para el ${mission.date}`
            : undefined
        }
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink-600 transition-colors',
          checked && 'border-gold-500 bg-gold-500 text-ink-950',
          done && !checked && 'opacity-50',
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </button>

      <button
        className="flex-1 text-left"
        onClick={() => onEdit?.(mission)}
        disabled={!onEdit}
      >
        <p className={cn('text-sm font-medium text-ink-50', mission.status === 'completada' && 'line-through')}>
          {mission.title}
        </p>
        <p className={cn('flex flex-wrap items-center gap-x-1 text-[11px]', overdue ? 'text-red-400' : 'text-ink-400')}>
          <span>{doneForCycle ? `Próxima: ${mission.date}` : text}</span>
          {mission.time && <span>· {mission.time}</span>}
          <span className="inline-flex items-center gap-0.5">
            · {repeating && <Repeat size={10} />} {REPEAT_LABEL[mission.repeat]}
          </span>
          {repeating && (mission.completedCount ?? 0) > 0 && <span>· ✓ {mission.completedCount}</span>}
          {mission.location && <span>· 📍</span>}
        </p>
      </button>

      <div className="flex items-center gap-2">
        <p className="font-pixel text-[10px] text-gold-400">+{mission.xp} XP</p>
        {overdue && onMoveToToday && (
          <button
            onClick={() => onMoveToToday(mission.id)}
            title="Mover a hoy"
            className="text-ink-400 hover:text-gold-400"
          >
            <CalendarArrowDown size={14} />
          </button>
        )}
        {onEdit && (
          <button onClick={() => onEdit(mission)} className="text-ink-400 hover:text-ink-50">
            <Pencil size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}
