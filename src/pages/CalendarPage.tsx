import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { buildMonthGrid, toDateKey, MONTH_LABELS, WEEKDAY_LABELS } from '@/lib/calendar'
import { groupMissionsByDate } from '@/lib/planning/calendarEngine'
import { MissionFormDialog } from '@/components/planning/MissionFormDialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

export function CalendarPage() {
  const missions = useGameStore((s) => s.missions)
  const goals = useGameStore((s) => s.goals)
  const addMission = useGameStore((s) => s.addMission)
  const updateMission = useGameStore((s) => s.updateMission)
  const deleteMission = useGameStore((s) => s.deleteMission)

  const today = new Date()
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedKey, setSelectedKey] = useState(todayKey)
  const [dialog, setDialog] = useState<{ open: boolean; mission?: Mission; date?: string }>({ open: false })

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])
  const missionsByDate = useMemo(() => groupMissionsByDate(missions), [missions])

  function goalOf(goalId: string) {
    return goals.find((g) => g.id === goalId)
  }

  function changeMonth(delta: 1 | -1) {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const selectedMissions = (missionsByDate.get(selectedKey) ?? []).sort((a, b) =>
    (a.time ?? '').localeCompare(b.time ?? ''),
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-pixel text-lg text-gold-400">Calendario</h1>
        <Button size="icon" onClick={() => setDialog({ open: true, date: selectedKey })}>
          <Plus size={18} />
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="rounded-full p-2 text-ink-400 hover:text-ink-50">
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-medium text-ink-50">
          {MONTH_LABELS[cursor.month]} {cursor.year}
        </p>
        <button onClick={() => changeMonth(1)} className="rounded-full p-2 text-ink-400 hover:text-ink-50">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-[10px] text-ink-400">
            {label}
          </div>
        ))}

        {grid.map((cell, i) => {
          const dayMissions = cell.dateKey ? (missionsByDate.get(cell.dateKey) ?? []) : []
          const isToday = cell.dateKey === todayKey
          const isSelected = cell.dateKey === selectedKey

          return (
            <button
              key={i}
              disabled={!cell.dateKey}
              onClick={() => cell.dateKey && setSelectedKey(cell.dateKey)}
              className={cn(
                'flex aspect-square flex-col items-center justify-center rounded-lg text-xs text-ink-200',
                !cell.day && 'invisible',
                isToday && 'font-pixel text-[9px] text-gold-400',
                isSelected && 'bg-ink-800',
              )}
            >
              {cell.day}
              {dayMissions.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {dayMissions.slice(0, 3).map((m) => (
                    <span
                      key={m.id}
                      className={cn('h-1 w-1 rounded-full', m.status === 'completada' ? 'bg-ink-600' : 'bg-gold-500')}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-ink-400">
            {selectedKey === todayKey ? 'Hoy' : selectedKey}
          </p>
          <button
            onClick={() => setDialog({ open: true, date: selectedKey })}
            className="text-xs text-gold-400"
          >
            + Agregar misión
          </button>
        </div>

        {selectedMissions.length === 0 && (
          <p className="text-sm text-ink-400">Sin misiones este día.</p>
        )}

        <div className="flex flex-col gap-2">
          {selectedMissions.map((mission) => {
            const goal = goalOf(mission.goalId)
            return (
              <button
                key={mission.id}
                onClick={() => setDialog({ open: true, mission })}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-left',
                  mission.status === 'completada' && 'opacity-50',
                )}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                  style={{
                    backgroundColor: goal ? `color-mix(in srgb, ${goal.color} 25%, transparent)` : 'var(--color-ink-800)',
                  }}
                >
                  {goal?.icon ?? '📌'}
                </span>
                <span className="flex-1">
                  <p className={cn('text-sm font-medium text-ink-50', mission.status === 'completada' && 'line-through')}>
                    {mission.title}
                  </p>
                  <p className="text-[11px] text-ink-400">
                    {mission.time ? `${mission.time} · ` : ''}
                    {goal?.name}
                  </p>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <MissionFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        defaultDate={dialog.date}
        mission={dialog.mission}
        onSubmit={(input) => (dialog.mission ? updateMission(dialog.mission.id, input) : addMission(input))}
        onDelete={dialog.mission ? () => deleteMission(dialog.mission!.id) : undefined}
      />
    </div>
  )
}
