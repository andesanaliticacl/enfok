import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { MissionRow } from '@/components/missions/MissionRow'
import { XpToast } from '@/components/missions/XpToast'
import { MissionFormDialog } from '@/components/planning/MissionFormDialog'
import { Button } from '@/components/ui/button'
import type { Mission } from '@/types'

export function MissionsPage() {
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)
  const addMission = useGameStore((s) => s.addMission)
  const updateMission = useGameStore((s) => s.updateMission)
  const deleteMission = useGameStore((s) => s.deleteMission)

  const [dialog, setDialog] = useState<{ open: boolean; mission?: Mission }>({ open: false })

  const pending = useMemo(
    () => [...missions].filter((m) => m.status === 'pendiente').sort((a, b) => a.date.localeCompare(b.date)),
    [missions],
  )
  const completed = useMemo(() => missions.filter((m) => m.status === 'completada'), [missions])

  return (
    <div>
      <XpToast />

      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-pixel text-lg text-gold-400">Misiones</h1>
        <Button size="icon" onClick={() => setDialog({ open: true })}>
          <Plus size={18} />
        </Button>
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Pendientes</h2>
        {pending.length === 0 && <p className="text-sm text-ink-400">No tienes misiones pendientes.</p>}
        <div className="flex flex-col gap-2">
          {pending.map((mission) => (
            <MissionRow
              key={mission.id}
              mission={mission}
              onComplete={completeMission}
              onEdit={(m) => setDialog({ open: true, mission: m })}
            />
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

      <MissionFormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        mission={dialog.mission}
        onSubmit={(input) => (dialog.mission ? updateMission(dialog.mission.id, input) : addMission(input))}
        onDelete={dialog.mission ? () => deleteMission(dialog.mission!.id) : undefined}
      />
    </div>
  )
}
