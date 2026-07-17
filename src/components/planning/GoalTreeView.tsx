import { Plus, Pencil, CalendarClock, Trophy } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { goalProgress } from '@/lib/planning/goalEngine'
import { diffDays, todayKey } from '@/lib/calendar'
import { MissionRow } from '@/components/missions/MissionRow'
import { cn } from '@/lib/utils'
import type { Goal, Mission } from '@/types'

function dueChip(goal: Goal, today: string): { text: string; danger: boolean } | null {
  if (!goal.dueDate || goal.status === 'completado') return null
  const delta = diffDays(today, goal.dueDate)
  if (delta < 0) return { text: `Venció hace ${-delta}d`, danger: true }
  if (delta === 0) return { text: 'Vence hoy', danger: true }
  if (delta <= 7) return { text: `${delta}d restantes`, danger: false }
  return { text: `Vence ${goal.dueDate}`, danger: false }
}

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
        const chip = dueChip(goal, todayKey())

        return (
          <div key={goal.id}>
            <div className="rounded-2xl border-2 bg-ink-900 p-3" style={{ borderColor: goal.color }}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-xl">{goal.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-50">{goal.name}</p>
                    <p className="truncate text-[10px] text-ink-400">{goal.description || 'Sin descripción'}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {goal.status === 'completado' ? (
                    <span className="flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 font-pixel text-[9px] text-gold-400">
                      <Trophy size={10} /> Completada
                    </span>
                  ) : (
                    <span className="font-pixel text-[10px] text-gold-400">{progress}%</span>
                  )}
                  <button onClick={() => onEditGoal(goal)} className="text-ink-400 hover:text-ink-50">
                    <Pencil size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.status === 'completado' ? 100 : progress}%`, backgroundColor: goal.color }}
                  />
                </div>
                {chip && (
                  <span
                    className={cn(
                      'flex shrink-0 items-center gap-1 text-[10px]',
                      chip.danger ? 'text-red-400' : 'text-ink-400',
                    )}
                  >
                    <CalendarClock size={11} /> {chip.text}
                  </span>
                )}
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
