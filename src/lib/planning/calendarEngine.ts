import type { Mission } from '@/types'

/**
 * The calendar has no data of its own — it is always a read projection of
 * missions grouped by their `date`. Editing a mission's date is the only way
 * to move it on the calendar; there is no separate calendar-event entity.
 */
export function groupMissionsByDate(missions: Mission[]): Map<string, Mission[]> {
  const map = new Map<string, Mission[]>()
  for (const mission of missions) {
    const list = map.get(mission.date) ?? []
    list.push(mission)
    map.set(mission.date, list)
  }
  return map
}

