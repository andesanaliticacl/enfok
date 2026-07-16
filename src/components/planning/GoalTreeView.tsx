import { Plus, Pencil } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { goalProgress } from '@/lib/planning/goalEngine'
import { MissionRow } from '@/components/missions/MissionRow'
import type { Goal, Mission } from '@/types'

interface GoalTreeViewProps {
  onEditGoal: (goal: Goal) => void
  onCreateMission: (goalId: string) => void
  onEditMission: (mission: Mission) => void
}

/** Goals as trunk nodes with their missions branching off below — the tree the Misiones page shows. */
export function GoalTreeView({ onEditGoal, onCreateMission, onEditMission }: GoalTreeViewProps) {
  const goals = useGameStore((s) => s.goals)
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)

  if (goals.length === 0) {
    return <p className="text-sm text-ink-400">Todavía no tenés metas. Creá la primera para empezar a ramificar misiones.</p>
  }

  return (
    <div className="flex flex-col gap-7">
      {goals.map((goal) => {
        const goalMissions = missions.filter((m) => m.goalId === goal.id)
        const progress = goalProgress(goal, missions)
        const branchColor = `color-mix(in srgb, ${goal.color} 50%, transparent)`

        return (
          <div key={goal.id}>
            <div className="flex items-center justify-between gap-2 rounded-2xl border-2 bg-ink-900 p-3" style={{ borderColor: goal.color }}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xl">{goal.icon}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-50">{goal.name}</p>
                  <p className="truncate text-[10px] text-ink-400">{goal.description || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-pixel text-[10px] text-gold-400">{progress}%</span>
                <button onClick={() => onEditGoal(goal)} className="text-ink-400 hover:text-ink-50">
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            <div className="ml-5 mt-2 flex flex-col gap-2 border-l-2 border-dashed pl-4" style={{ borderColor: branchColor }}>
              {goalMissions.map((mission) => (
                <div key={mission.id} className="relative">
                  <span className="absolute -left-4 top-4 h-px w-4" style={{ backgroundColor: branchColor }} />
                  <MissionRow mission={mission} onComplete={completeMission} onEdit={onEditMission} />
                </div>
              ))}
              <div className="relative">
                <span className="absolute -left-4 top-4 h-px w-4" style={{ backgroundColor: branchColor }} />
                <button
                  onClick={() => onCreateMission(goal.id)}
                  className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-ink-600 py-2 text-xs text-ink-400 hover:text-ink-50"
                >
                  <Plus size={14} /> Agregar misión
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
