import type { Goal, Mission, MissionLocation, Priority, RegionId } from '@/types'

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

export function goalProgress(goal: Goal, missions: Mission[]): number {
  const goalMissions = missions.filter((m) => m.goalId === goal.id)
  if (goalMissions.length === 0) return 0
  const done = goalMissions.filter((m) => m.status === 'completada').length
  return Math.round((done / goalMissions.length) * 100)
}

export function isGoalComplete(goal: Goal, missions: Mission[]): boolean {
  const goalMissions = missions.filter((m) => m.goalId === goal.id)
  return goalMissions.length > 0 && goalMissions.every((m) => m.status === 'completada')
}

export function regionProgress(regionId: RegionId, goals: Goal[], missions: Mission[]): number {
  const regionMissions = missions.filter((m) => goals.some((g) => g.regionId === regionId && g.id === m.goalId))
  if (regionMissions.length === 0) return 0
  const done = regionMissions.filter((m) => m.status === 'completada').length
  return Math.round((done / regionMissions.length) * 100)
}
