import { useMemo } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { MissionRow } from '@/components/missions/MissionRow'
import type { Mission } from '@/types'

interface MissionsListViewProps {
  onEdit: (mission: Mission) => void
}

export function MissionsListView({ onEdit }: MissionsListViewProps) {
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)

  const pending = useMemo(
    () => [...missions].filter((m) => m.status === 'pendiente').sort((a, b) => a.date.localeCompare(b.date)),
    [missions],
  )
  const completed = useMemo(() => missions.filter((m) => m.status === 'completada'), [missions])

  return (
    <div>
      <section className="mb-6">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Pendientes</h2>
        {pending.length === 0 && <p className="text-sm text-ink-400">No tienes misiones pendientes.</p>}
        <div className="flex flex-col gap-2">
          {pending.map((mission) => (
            <MissionRow key={mission.id} mission={mission} onComplete={completeMission} onEdit={onEdit} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Completadas</h2>
        <div className="flex flex-col gap-2">
          {completed.map((mission) => (
            <MissionRow key={mission.id} mission={mission} onComplete={completeMission} />
          ))}
        </div>
      </section>
    </div>
  )
}
