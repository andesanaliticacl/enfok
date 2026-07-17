import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { addDaysToKey, todayKey } from '@/lib/calendar'
import { MissionRow } from '@/components/missions/MissionRow'
import { cn } from '@/lib/utils'
import type { Mission } from '@/types'

interface MissionsListViewProps {
  onEdit: (mission: Mission) => void
}

interface Section {
  key: string
  title: string
  missions: Mission[]
  accent?: 'danger' | 'gold'
}

function byDateAndTime(a: Mission, b: Mission): number {
  return a.date.localeCompare(b.date) || (a.time ?? '99').localeCompare(b.time ?? '99')
}

export function MissionsListView({ onEdit }: MissionsListViewProps) {
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)
  const moveMission = useGameStore((s) => s.moveMission)

  const [showCompleted, setShowCompleted] = useState(false)

  const today = todayKey()
  const tomorrow = addDaysToKey(today, 1)
  const weekEnd = addDaysToKey(today, 7)

  const { sections, completed } = useMemo(() => {
    const pending = missions.filter((m) => m.status !== 'completada').sort(byDateAndTime)
    const completed = missions
      .filter((m) => m.status === 'completada')
      .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

    const sections: Section[] = [
      { key: 'vencidas', title: 'Vencidas', accent: 'danger', missions: pending.filter((m) => m.date < today) },
      { key: 'hoy', title: 'Hoy', accent: 'gold', missions: pending.filter((m) => m.date === today) },
      { key: 'manana', title: 'Mañana', missions: pending.filter((m) => m.date === tomorrow) },
      {
        key: 'semana',
        title: 'Próximos 7 días',
        missions: pending.filter((m) => m.date > tomorrow && m.date <= weekEnd),
      },
      { key: 'luego', title: 'Más adelante', missions: pending.filter((m) => m.date > weekEnd) },
    ]
    return { sections: sections.filter((s) => s.missions.length > 0), completed }
  }, [missions, today, tomorrow, weekEnd])

  return (
    <div>
      {sections.length === 0 && (
        <p className="mb-6 text-sm text-ink-400">
          No tienes misiones pendientes. Crea una con el botón + para planificar tu día.
        </p>
      )}

      {sections.map((section) => (
        <section key={section.key} className="mb-6">
          <h2
            className={cn(
              'mb-2 flex items-center gap-2 text-xs uppercase tracking-wide',
              section.accent === 'danger' ? 'text-red-400' : section.accent === 'gold' ? 'text-gold-400' : 'text-ink-400',
            )}
          >
            {section.title}
            <span className="rounded-full bg-ink-800 px-1.5 py-0.5 text-[10px] text-ink-300">
              {section.missions.length}
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {section.missions.map((mission) => (
              <MissionRow
                key={mission.id}
                mission={mission}
                onComplete={completeMission}
                onEdit={onEdit}
                onMoveToToday={section.key === 'vencidas' ? (id) => moveMission(id, today) : undefined}
              />
            ))}
          </div>
        </section>
      ))}

      {completed.length > 0 && (
        <section>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="mb-2 flex items-center gap-1 text-xs uppercase tracking-wide text-ink-400 hover:text-ink-200"
          >
            <ChevronDown size={14} className={cn('transition-transform', !showCompleted && '-rotate-90')} />
            Completadas ({completed.length})
          </button>
          {showCompleted && (
            <div className="flex flex-col gap-2">
              {completed.map((mission) => (
                <MissionRow key={mission.id} mission={mission} onComplete={completeMission} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
