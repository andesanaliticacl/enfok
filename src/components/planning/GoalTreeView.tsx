import { useState } from 'react'
import { Plus, Pencil, CalendarClock, Trophy, ChevronDown, ListChecks, LayoutList } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { goalProgress } from '@/lib/planning/goalEngine'
import { isDoneForNow } from '@/lib/planning/missionEngine'
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

/**
 * Goals as collapsible trunk nodes with their missions branching below. A
 * "Pendientes" filter folds in what the old flat list did: show only missions
 * still to do, kept grouped under their goal so the association is always clear.
 */
export function GoalTreeView({ onEditGoal, onCreateMission, onEditMission }: GoalTreeViewProps) {
  const goals = useGameStore((s) => s.goals)
  const missions = useGameStore((s) => s.missions)
  const completeMission = useGameStore((s) => s.completeMission)
  const moveMission = useGameStore((s) => s.moveMission)

  const today = todayKey()
  const [onlyPending, setOnlyPending] = useState(false)
  // Goals start closed — an empty set means nothing is expanded yet, including
  // goals added later, so the tree opens as a tidy list of collapsed trunks.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(goalId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(goalId) ? next.delete(goalId) : next.add(goalId)
      return next
    })
  }

  if (goals.length === 0) {
    return <p className="text-sm text-ink-400">Todavía no tenés metas. Creá la primera para empezar a ramificar misiones.</p>
  }

  // In "pending" mode, goals with nothing left to do drop out entirely.
  const visibleGoals = goals.filter((goal) => {
    if (!onlyPending) return true
    return missions.some((m) => m.goalId === goal.id && !isDoneForNow(m, today))
  })

  const totalPending = missions.filter((m) => !isDoneForNow(m, today)).length

  return (
    <div>
      {/* Filter: the old Lista lives here now, as a toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setOnlyPending(false)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            !onlyPending && 'bg-ink-800 text-gold-400',
          )}
        >
          <LayoutList size={13} /> Todas
        </button>
        <button
          onClick={() => setOnlyPending(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-400',
            onlyPending && 'bg-ink-800 text-gold-400',
          )}
        >
          <ListChecks size={13} /> Pendientes
          <span className="rounded-full bg-ink-700 px-1.5 text-[10px] text-ink-200">{totalPending}</span>
        </button>
      </div>

      {visibleGoals.length === 0 && (
        <p className="text-sm text-ink-400">🎉 No te queda nada pendiente. ¡Bien ahí!</p>
      )}

      <div className="flex flex-col gap-5">
        {visibleGoals.map((goal) => {
          const allGoalMissions = missions.filter((m) => m.goalId === goal.id)
          const goalMissions = onlyPending ? allGoalMissions.filter((m) => !isDoneForNow(m, today)) : allGoalMissions
          const progress = goalProgress(goal, missions)
          const branchColor = `color-mix(in srgb, ${goal.color} 50%, transparent)`
          const chip = dueChip(goal, today)
          const isOpen = expanded.has(goal.id)
          const pendingCount = allGoalMissions.filter((m) => !isDoneForNow(m, today)).length

          return (
            <div key={goal.id}>
              {/* Goal header doubles as the collapse toggle */}
              <button
                onClick={() => toggle(goal.id)}
                className="w-full rounded-2xl border-2 bg-ink-900 p-3 text-left"
                style={{ borderColor: goal.color }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <ChevronDown size={16} className={cn('shrink-0 text-ink-400 transition-transform', !isOpen && '-rotate-90')} />
                    <span className="text-xl">{goal.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-50">{goal.name}</p>
                      <p className="truncate text-[10px] text-ink-400">
                        {pendingCount > 0 ? `${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}` : goal.description || 'Sin descripción'}
                      </p>
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
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditGoal(goal)
                      }}
                      className="cursor-pointer text-ink-400 hover:text-ink-50"
                    >
                      <Pencil size={14} />
                    </span>
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
                    <span className={cn('flex shrink-0 items-center gap-1 text-[10px]', chip.danger ? 'text-red-400' : 'text-ink-400')}>
                      <CalendarClock size={11} /> {chip.text}
                    </span>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="ml-5 mt-2 flex flex-col gap-2 border-l-2 border-dashed pl-4" style={{ borderColor: branchColor }}>
                  {goalMissions.map((mission) => (
                    <div key={mission.id} className="relative">
                      <span className="absolute -left-4 top-4 h-px w-4" style={{ backgroundColor: branchColor }} />
                      <MissionRow
                        mission={mission}
                        onComplete={completeMission}
                        onEdit={onEditMission}
                        onMoveToToday={(id) => moveMission(id, today)}
                      />
                    </div>
                  ))}
                  {onlyPending && goalMissions.length === 0 && (
                    <p className="text-[11px] text-ink-600">Sin pendientes en esta meta.</p>
                  )}
                  {!onlyPending && (
                    <div className="relative">
                      <span className="absolute -left-4 top-4 h-px w-4" style={{ backgroundColor: branchColor }} />
                      <button
                        onClick={() => onCreateMission(goal.id)}
                        className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-ink-600 py-2 text-xs text-ink-400 hover:text-ink-50"
                      >
                        <Plus size={14} /> Agregar misión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
