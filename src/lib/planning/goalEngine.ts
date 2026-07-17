import { diffDays, todayKey } from '@/lib/calendar'
import { isRepeating } from '@/lib/planning/missionEngine'
import type { Goal, GoalStatus, Mission, MissionLocation, Priority, Region, RegionId } from '@/types'

export interface GoalInput {
  regionId: RegionId
  name: string
  description: string
  category: string
  startDate?: string
  dueDate?: string
  priority: Priority
  xpReward: number
  reward?: string
  color: string
  icon: string
  location?: MissionLocation
}

export function createGoal(input: GoalInput): Goal {
  return {
    id: `goal-${crypto.randomUUID()}`,
    status: 'no_iniciado',
    missionIds: [],
    ...input,
  }
}

/**
 * Progress of a goal:
 * - With one-off missions, it's deliverable-based: completed / total one-offs.
 *   Repeating missions are habits — they sustain the goal but can't "finish" it,
 *   so they don't dilute the percentage.
 * - A habit-only goal (only repeating missions) progresses with time across its
 *   startDate→dueDate window, like a season pass.
 */
export function goalProgress(goal: Goal, missions: Mission[], today = todayKey()): number {
  const goalMissions = missions.filter((m) => m.goalId === goal.id)
  if (goalMissions.length === 0) return 0

  const oneOffs = goalMissions.filter((m) => !isRepeating(m))
  if (oneOffs.length > 0) {
    const done = oneOffs.filter((m) => m.status === 'completada').length
    return Math.round((done / oneOffs.length) * 100)
  }

  if (goal.startDate && goal.dueDate) {
    const total = diffDays(goal.startDate, goal.dueDate)
    if (total <= 0) return today >= goal.dueDate ? 100 : 0
    const elapsed = diffDays(goal.startDate, today)
    return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)))
  }
  return 0
}

export function isGoalComplete(goal: Goal, missions: Mission[], today = todayKey()): boolean {
  const goalMissions = missions.filter((m) => m.goalId === goal.id)
  if (goalMissions.length === 0) return false

  const oneOffs = goalMissions.filter((m) => !isRepeating(m))
  if (oneOffs.length > 0) return oneOffs.every((m) => m.status === 'completada')

  // Habit-only goals complete when their window closes.
  return !!goal.dueDate && today > goal.dueDate
}

/**
 * Status is always derived from the missions, never edited by hand — completing
 * the last mission closes the goal, and adding a new mission to a closed goal
 * reopens it.
 */
export function computeGoalStatus(goal: Goal, missions: Mission[], today = todayKey()): GoalStatus {
  if (isGoalComplete(goal, missions, today)) return 'completado'
  const started = missions.some(
    (m) => m.goalId === goal.id && (m.status === 'completada' || (m.completedCount ?? 0) > 0),
  )
  return started ? 'en_progreso' : 'no_iniciado'
}

export function recomputeGoalStatuses(goals: Goal[], missions: Mission[], today = todayKey()): Goal[] {
  return goals.map((g) => {
    const status = computeGoalStatus(g, missions, today)
    return status === g.status ? g : { ...g, status }
  })
}

/** A region levels up as its goals complete: 0 = locked (no goals yet), 1 = active, +1 per completed goal. */
export function regionLevel(regionId: RegionId, goals: Goal[]): number {
  const regionGoals = goals.filter((g) => g.regionId === regionId)
  if (regionGoals.length === 0) return 0
  return 1 + regionGoals.filter((g) => g.status === 'completado').length
}

export function syncRegionLevels(regions: Region[], goals: Goal[]): Region[] {
  return regions.map((r) => {
    const level = regionLevel(r.id, goals)
    return level === r.level ? r : { ...r, level }
  })
}

export function regionProgress(regionId: RegionId, goals: Goal[], missions: Mission[]): number {
  const regionMissions = missions.filter((m) => goals.some((g) => g.regionId === regionId && g.id === m.goalId))
  if (regionMissions.length === 0) return 0
  const done = regionMissions.filter((m) => m.status === 'completada').length
  return Math.round((done / regionMissions.length) * 100)
}
