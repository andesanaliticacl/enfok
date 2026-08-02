import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Check, Sun, Sunset, Moon } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { addDaysToKey, todayKey } from '@/lib/calendar'
import { WEEKDAY_NAMES, dayCellState, missionsForDay, mondayOf, weekDates, weekdayIndex } from '@/lib/planning/dayView'
import { cn } from '@/lib/utils'
import type { Goal, Mission } from '@/types'

interface DayViewProps {
  onEdit: (mission: Mission) => void
}

const HOUR_PX = 58
const CARD_H = 52
const WEEKDAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * "Mi día" — a visual weekly planner. A day strip up top scans the whole week
 * (each day dotted by its goals), and the selected day opens as a real hourly
 * timeline: timed missions sit at their hour like calendar blocks, with a live
 * "now" line on today. Untimed missions ride a lane above the clock.
 */
export function DayView({ onEdit }: DayViewProps) {
  const missions = useGameStore((s) => s.missions)
  const goals = useGameStore((s) => s.goals)
  const completeMission = useGameStore((s) => s.completeMission)

  const today = todayKey()
  const [weekStart, setWeekStart] = useState(() => mondayOf(today))
  const [selected, setSelected] = useState(today)

  const days = useMemo(() => weekDates(weekStart), [weekStart])
  const goalOf = (goalId: string): Goal | undefined => goals.find((g) => g.id === goalId)

  const dayMissions = useMemo(() => missionsForDay(missions, selected), [missions, selected])
  const timed = dayMissions.filter((m) => m.time)
  const untimed = dayMissions.filter((m) => !m.time)

  // Timeline window: cover every timed mission, padded, but never narrower than 7–21h.
  const { startHour, endHour } = useMemo(() => {
    const hours = timed.map((m) => minutesOf(m.time!) / 60)
    const min = Math.floor(Math.min(7, ...hours.length ? hours : [7]))
    const max = Math.ceil(Math.max(21, ...hours.length ? hours : [21]))
    return { startHour: Math.max(0, min), endHour: Math.min(24, max) }
  }, [timed])

  // Absolute Y for a time, with collision push-down so stacked cards stay readable.
  const placed = useMemo(() => {
    let lastBottom = -Infinity
    return timed.map((m) => {
      const idealTop = ((minutesOf(m.time!) - startHour * 60) / 60) * HOUR_PX
      const top = Math.max(idealTop, lastBottom + 6)
      lastBottom = top + CARD_H
      return { mission: m, top }
    })
  }, [timed, startHour])

  const timelineHeight = Math.max((endHour - startHour) * HOUR_PX, placed.length ? placed[placed.length - 1].top + CARD_H + 8 : 0)

  const now = new Date()
  const nowTop = ((now.getHours() * 60 + now.getMinutes()) - startHour * 60) / 60 * HOUR_PX
  const showNow = selected === today && nowTop >= 0 && nowTop <= timelineHeight

  const selDow = weekdayIndex(selected)
  const monthName = new Date(Number(weekStart.slice(0, 4)), Number(weekStart.slice(5, 7)) - 1, 1).toLocaleDateString('es-CL', { month: 'long' })

  function selectAndKeep(dayKey: string) {
    setSelected(dayKey)
  }

  function shiftWeek(delta: number) {
    const nextStart = addDaysToKey(weekStart, delta)
    setWeekStart(nextStart)
    // Keep the same weekday selected in the new week (or today if it lands there).
    const sameDow = addDaysToKey(nextStart, weekdayIndex(selected))
    setSelected(weekDates(nextStart).includes(today) ? today : sameDow)
  }

  return (
    <div>
      {/* Week strip — the whole week at a glance */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={() => shiftWeek(-7)} className="rounded-full p-1.5 text-ink-400 hover:text-ink-50">
            <ChevronLeft size={16} />
          </button>
          <p className="text-xs font-medium capitalize text-ink-300">{monthName}</p>
          <button onClick={() => shiftWeek(7)} className="rounded-full p-1.5 text-ink-400 hover:text-ink-50">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex justify-between gap-1">
          {days.map((dayKey, i) => {
            const dm = missionsForDay(missions, dayKey)
            const isToday = dayKey === today
            const isSel = dayKey === selected
            const dotColors = [...new Set(dm.map((m) => goalOf(m.goalId)?.color).filter(Boolean))].slice(0, 3) as string[]
            return (
              <button
                key={dayKey}
                onClick={() => selectAndKeep(dayKey)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 transition-colors',
                  isSel ? 'border-gold-400 bg-gold-500/15' : 'border-transparent hover:bg-ink-800/60',
                )}
              >
                <span className={cn('text-[9px] font-medium', isSel ? 'text-gold-400' : 'text-ink-500')}>{WEEKDAY_SHORT[i]}</span>
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                    isToday && !isSel && 'ring-2 ring-gold-400/50',
                    isSel ? 'bg-gold-500 text-ink-950' : 'text-ink-100',
                  )}
                >
                  {dayKey.slice(8, 10)}
                </span>
                <span className="flex h-1.5 items-center gap-0.5">
                  {dotColors.map((c, j) => (
                    <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day heading */}
      <div className="mb-3 flex items-baseline gap-2">
        <h3 className="text-sm font-semibold text-ink-50">
          {WEEKDAY_NAMES[selDow]} {selected.slice(8, 10)}
        </h3>
        {selected === today && <span className="font-pixel text-[8px] text-gold-400">HOY</span>}
        <span className="ml-auto text-[11px] text-ink-500">{dayMissions.length} misión{dayMissions.length === 1 ? '' : 'es'}</span>
      </div>

      {dayMissions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink-700 py-10 text-center">
          <p className="text-sm text-ink-500">Nada agendado este día.</p>
          <p className="mt-1 text-[11px] text-ink-600">Disfruta el descanso o agrega una misión.</p>
        </div>
      )}

      {/* Untimed lane — missions without an hour */}
      {untimed.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wide text-ink-500">Sin hora</p>
          <div className="flex flex-col gap-1.5">
            {untimed.map((m) => (
              <DayMissionCard key={m.id} mission={m} goal={goalOf(m.goalId)} dayKey={selected} today={today} onComplete={completeMission} onEdit={onEdit} />
            ))}
          </div>
        </div>
      )}

      {/* Hourly timeline — the visual heart of the day */}
      {timed.length > 0 && (
        <div className="relative" style={{ height: timelineHeight }}>
          {/* Hour rails */}
          {Array.from({ length: endHour - startHour + 1 }, (_, i) => {
            const hour = startHour + i
            const top = i * HOUR_PX
            const period = hour < 12 ? Sun : hour < 19 ? Sunset : Moon
            const Icon = period
            return (
              <div key={hour} className="absolute left-0 right-0 flex items-center gap-2" style={{ top }}>
                <span className="flex w-11 shrink-0 items-center justify-end gap-1 text-[9px] text-ink-600">
                  <Icon size={9} /> {String(hour).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-ink-800" />
              </div>
            )
          })}

          {/* Now line */}
          {showNow && (
            <div className="absolute left-11 right-0 z-20 flex items-center" style={{ top: nowTop }}>
              <span className="h-2 w-2 -translate-x-1/2 rounded-full bg-red-500" />
              <span className="h-px flex-1 bg-red-500/70" />
            </div>
          )}

          {/* Timed mission cards, positioned by hour */}
          {placed.map(({ mission, top }) => (
            <div key={mission.id} className="absolute left-11 right-0 z-10 pl-2" style={{ top }}>
              <DayMissionCard mission={mission} goal={goalOf(mission.goalId)} dayKey={selected} today={today} onComplete={completeMission} onEdit={onEdit} showTime />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CardProps {
  mission: Mission
  goal?: Goal
  dayKey: string
  today: string
  onComplete: (id: string) => void
  onEdit: (mission: Mission) => void
  showTime?: boolean
}

function DayMissionCard({ mission, goal, dayKey, today, onComplete, onEdit, showTime }: CardProps) {
  const { done, actionable } = dayCellState(mission, dayKey, today)
  const color = goal?.color ?? 'var(--color-ink-600)'

  return (
    <div
      className={cn('flex items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-900 px-2.5 py-2', done && 'opacity-50')}
      style={{ borderLeft: `3px solid ${color}`, height: CARD_H }}
    >
      <button
        onClick={() => actionable && onComplete(mission.id)}
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
        <p className={cn('truncate text-xs font-medium text-ink-50', done && 'line-through')}>{mission.title}</p>
        <p className="flex items-center gap-1 truncate text-[10px] text-ink-400">
          {showTime && mission.time && <span className="font-pixel text-[8px] text-gold-400">{mission.time}</span>}
          <span>{goal?.icon ?? '📌'}</span>
          <span className="truncate">{goal?.name ?? 'Sin meta'}</span>
        </p>
      </button>

      <span className="shrink-0 font-pixel text-[9px] text-gold-400">+{mission.xp}</span>
    </div>
  )
}
