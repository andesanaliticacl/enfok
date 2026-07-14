import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/store/useGameStore'
import { buildMonthGrid, toDateKey, MONTH_LABELS, WEEKDAY_LABELS } from '@/lib/calendar'
import { cn } from '@/lib/utils'

export function CalendarPage() {
  const navigate = useNavigate()
  const objectives = useGameStore((s) => s.objectives)
  const regions = useGameStore((s) => s.regions)

  const today = new Date()
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selectedKey, setSelectedKey] = useState(todayKey)

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])

  const objectivesByDate = useMemo(() => {
    const map = new Map<string, typeof objectives>()
    for (const objective of objectives) {
      if (!objective.dueDate) continue
      const list = map.get(objective.dueDate) ?? []
      list.push(objective)
      map.set(objective.dueDate, list)
    }
    return map
  }, [objectives])

  function regionColor(regionId: string) {
    return regions.find((r) => r.id === regionId)?.color ?? 'var(--color-gold-500)'
  }

  function changeMonth(delta: 1 | -1) {
    setCursor((c) => {
      const next = new Date(c.year, c.month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const selectedObjectives = objectivesByDate.get(selectedKey) ?? []

  return (
    <div>
      <h1 className="mb-6 font-pixel text-lg text-gold-400">Calendario</h1>

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
          const dueObjectives = cell.dateKey ? (objectivesByDate.get(cell.dateKey) ?? []) : []
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
              {dueObjectives.length > 0 && (
                <div className="mt-0.5 flex gap-0.5">
                  {dueObjectives.slice(0, 3).map((o) => (
                    <span
                      key={o.id}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: regionColor(o.regionId) }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-wide text-ink-400">
          {selectedKey === todayKey ? 'Hoy' : selectedKey}
        </p>
        {selectedObjectives.length === 0 && (
          <p className="text-sm text-ink-400">Sin objetivos con vencimiento este día.</p>
        )}
        <div className="flex flex-col gap-2">
          {selectedObjectives.map((objective) => (
            <button
              key={objective.id}
              onClick={() => navigate(`/region/${objective.regionId}`)}
              className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-left"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ backgroundColor: `color-mix(in srgb, ${regionColor(objective.regionId)} 25%, transparent)` }}
              >
                {objective.icon}
              </span>
              <span className="text-sm font-medium text-ink-50">{objective.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
