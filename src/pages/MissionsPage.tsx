import { useGameStore } from '@/store/useGameStore'
import { MissionRow } from '@/components/missions/MissionRow'
import { XpToast } from '@/components/missions/XpToast'

export function MissionsPage() {
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)

  const pending = missions.filter((m) => m.status === 'pendiente')
  const completed = missions.filter((m) => m.status === 'completada')

  return (
    <div>
      <XpToast />
      <h1 className="mb-6 font-pixel text-lg text-gold-400">Misiones</h1>

      <section className="mb-6">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Pendientes</h2>
        <div className="flex flex-col gap-2">
          {pending.map((mission) => (
            <MissionRow key={mission.id} mission={mission} onComplete={completeMission} />
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
