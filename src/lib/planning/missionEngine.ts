import { todayKey } from '@/lib/calendar'
import type { Mission, MissionLocation, MissionRepeat, Priority } from '@/types'

export interface MissionInput {
  goalId: string
  title: string
  description: string
  date: string
  time?: string
  priority: Priority
  xp: number
  coins: number
  estimatedMinutes?: number
  tags: string[]
  repeat: MissionRepeat
  location?: MissionLocation
}

export function createMission(input: MissionInput): Mission {
  return {
    id: `mission-${crypto.randomUUID()}`,
    status: 'pendiente',
    ...input,
  }
}

/** Advances an ISO date (yyyy-mm-dd) forward according to a repeat rule. */
export function nextOccurrence(dateKey: string, repeat: MissionRepeat): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)

  switch (repeat) {
    case 'diaria':
      date.setDate(date.getDate() + 1)
      break
    case 'semanal':
      date.setDate(date.getDate() + 7)
      break
    case 'mensual':
      date.setMonth(date.getMonth() + 1)
      break
    default:
      break
  }

  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** Daily/weekly/monthly missions recur; 'ninguna' and 'personalizada' behave as one-offs. */
export function isRepeating(mission: Mission): boolean {
  return mission.repeat === 'diaria' || mission.repeat === 'semanal' || mission.repeat === 'mensual'
}

/**
 * True when the mission needs no action right now: a completed one-off, or a
 * repeating mission whose next occurrence is still in the future (already done
 * for this cycle). Guards both the UI checkbox and the store against double XP.
 */
export function isDoneForNow(mission: Mission, today = todayKey()): boolean {
  if (mission.status === 'completada') return true
  return isRepeating(mission) && mission.date > today
}

/** Completions across the whole list — repeating missions count every occurrence. */
export function countCompletions(missions: Mission[]): number {
  return missions.reduce(
    (sum, m) => sum + (m.completedCount ?? (m.status === 'completada' ? 1 : 0)),
    0,
  )
}

/**
 * Completing a mission awards XP once per occurrence. A repeating mission rolls
 * forward to its next occurrence *after today* (an overdue daily habit reschedules
 * to tomorrow, not further into the past) and stays pending; a one-off mission is
 * marked completed. The calendar stays the single source of truth — no event rows.
 */
export function applyCompletion(mission: Mission, today = todayKey()): Mission {
  const completedAt = new Date().toISOString()
  const stamped = {
    ...mission,
    completedAt,
    completedCount: (mission.completedCount ?? 0) + 1,
    lastCompletedOn: today,
  }
  if (!isRepeating(mission)) {
    return { ...stamped, status: 'completada' as const }
  }
  // Advance from the scheduled date to preserve the cadence anchor (same weekday /
  // day of month), skipping past occurrences until we land after today.
  let next = nextOccurrence(mission.date, mission.repeat)
  while (next <= today) next = nextOccurrence(next, mission.repeat)
  return { ...stamped, date: next }
}
