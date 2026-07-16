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

/**
 * Completing a mission awards XP once. A repeating mission rolls forward to its
 * next occurrence and stays pending; a one-off mission is marked completed.
 * This keeps the calendar as the single source of truth — no separate event rows.
 */
export function applyCompletion(mission: Mission): Mission {
  const completedAt = new Date().toISOString()
  if (mission.repeat === 'ninguna' || mission.repeat === 'personalizada') {
    return { ...mission, status: 'completada', completedAt }
  }
  return { ...mission, date: nextOccurrence(mission.date, mission.repeat), completedAt }
}
