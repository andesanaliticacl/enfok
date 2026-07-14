import type { Mission, Objective, Region } from '@/types'

export function regionProgress(region: Region, objectives: Objective[], missions: Mission[]) {
  const regionMissions = missions.filter((m) =>
    objectives.some((o) => o.regionId === region.id && o.id === m.objectiveId),
  )
  if (regionMissions.length === 0) return 0
  const done = regionMissions.filter((m) => m.status === 'completada').length
  return Math.round((done / regionMissions.length) * 100)
}

export function objectiveProgress(objective: Objective, missions: Mission[]) {
  const objMissions = missions.filter((m) => m.objectiveId === objective.id)
  if (objMissions.length === 0) return 0
  const done = objMissions.filter((m) => m.status === 'completada').length
  return Math.round((done / objMissions.length) * 100)
}
