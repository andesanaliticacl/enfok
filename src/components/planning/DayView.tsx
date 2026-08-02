import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { addDaysToKey, todayKey } from '@/lib/calendar'
import {
  WEEKDAY_NAMES,
  dayCellState,
  missionsForDay,
  mondayOf,
  weekDates,
  weekdayIndex,
} from '@/lib/planning/dayView'
import { cn } from '@/lib/utils'
import type { Goal, Mission } from '@/types'

interface DayViewProps {
  onEdit: (mission: Mission) => void
}

/**
 * "Mi día" — a Monday→Sunday agenda of what to do day by day. Each day lists its
 * missions, timed ones placed by their hour, each labeled with its goal so you
 * know what it's for. Only today's pending missions are tappable to complete.
 */
export function DayView({ onEdit }: DayViewProps) {
  const missions = useGameStore((s) => s.missions)
  const goals = useGameStore((s) => s.goals)
  const completeMission = useGameStore((s) => s.completeMission)

  const today = todayKey()
  const [weekStart, setWeekStart] = useState(() => mondayOf(today))
  const days = useMemo(() => weekDates(weekStart), [weekStart])

  const goalOf = (goalId: string): Goal | undefined => goals.find((g) => g.id === goalId)

  const monthName = new Date(
    Number(weekStart.slice(0, 4)),
    Number(weekStart.slice(5, 7)) - 1,
    Number(weekStart.slice(8, 10)),
  ).toLocaleDateString('es-CL', { month: 'long' })
  const rangeLabel = `${days[0].slice(8, 10)} – ${days[6].slice(8, 10)} ${monthName}`

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setWeekStart((w) => addDaysToKey(w, -7))}
          className="rounded-full p-2 text-ink-400 hover:text-ink-50"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-medium capitalize text-ink-50">{rangeLabel}</p>
          {weekStart !== mondayOf(today) && (
            <button onClick={() => setWeekStart(mondayOf(today))} className="text-[10px] text-gold-400">
              Volver a esta semana
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekStart((w) => addDaysToKey(w, 7))}
          className="rounded-full p-2 text-ink-400 hover:text-ink-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {days.map((dayKey) => {
          const dayMissions = missionsForDay(missions, dayKey)
          const isToday = dayKey === today
          const dow = weekdayIndex(dayKey)

          return (
            <div
              key={dayKey}
              className={cn(
                'rounded-2xl border p-3',
                isToday ? 'border-gold-400/60 bg-gold-500/5' : 'border-ink-700 bg-ink-900/60',
              )}
            >
              <div className="mb-2 flex items-baseline justify-between">
                <p className={cn('text-sm font-semibold', isToday ? 'text-gold-400' : 'text-ink-100')}>
                  {WEEKDAY_NAMES[dow]}
                  {isToday && <span className="ml-1.5 font-pixel text-[8px] text-gold-400">HOY</span>}
                </p>
                <span className="text-[11px] text-ink-500">{dayKey.slice(8, 10)}</span>
              </div>

              {dayMissions.length === 0 ? (
                <p className="text-[11px] text-ink-600">Nada agendado.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {dayMissions.map((mission) => {
                    const goal = goalOf(mission.goalId)
                    const { done, actionable } = dayCellState(mission, dayKey, today)
                    return (
                      <div
                        key={mission.id}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border border-ink-800 bg-ink-900 px-2.5 py-2',
                          done && 'opacity-50',
                        )}
                      >
                        {/* Time slot — the "a qué hora" of the day */}
                        <div className={cn('flex w-12 shrink-0 flex-col items-center', mission.time ? 'text-ink-200' : 'text-ink-600')}>
                          {mission.time ? (
                            <span className="font-pixel text-[9px]">{mission.time}</span>
                          ) : (
                            <Clock size={12} className="text-ink-700" />
                          )}
                        </div>

                        <button
                          onClick={() => actionable && completeMission(mission.id)}
                          disabled={!actionable}
                          title={actionable ? 'Completar' : done ? 'Hecha' : 'Programada'}
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-ink-600',
                            done && 'border-gold-500 bg-gold-500 text-ink-950',
                            !actionable && !done && 'opacity-40',
                          )}
                        >
                          {done && <Check size={12} strokeWidth={3} />}
                        </button>

                        <button onClick={() => onEdit(mission)} className="min-w-0 flex-1 text-left">
                          <p className={cn('truncate text-xs font-medium text-ink-50', done && 'line-through')}>
                            {mission.title}
                          </p>
                          <p className="flex items-center gap-1 truncate text-[10px] text-ink-400">
                            <span>{goal?.icon ?? '📌'}</span>
                            <span className="truncate">{goal?.name ?? 'Sin meta'}</span>
                          </p>
                        </button>

                        <span className="shrink-0 font-pixel text-[9px] text-gold-400">+{mission.xp}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
