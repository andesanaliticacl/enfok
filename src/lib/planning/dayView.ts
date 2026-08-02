import { addDaysToKey, dateKeyOf, todayKey } from '@/lib/calendar'
import { isDoneForNow, isRepeating } from '@/lib/planning/missionEngine'
import type { Mission } from '@/types'

export const WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** Monday-first weekday index (0 = Monday … 6 = Sunday) of an ISO date key. */
export function weekdayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return (new Date(y, m - 1, d).getDay() + 6) % 7
}

function dayOfMonth(dateKey: string): number {
  return Number(dateKey.slice(8, 10))
}

/** The Monday of the week containing `dateKey`. */
export function mondayOf(dateKey: string): string {
  return addDaysToKey(dateKey, -weekdayIndex(dateKey))
}

/** The 7 ISO date keys of the week starting at `mondayKey`. */
export function weekDates(mondayKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToKey(mondayKey, i))
}

/**
 * Whether a mission lands on a given day, expanding its recurrence so a routine
 * fills the week: a daily mission every day, a weekly one on its weekday, a
 * monthly one on its day-of-month, and a one-off only on its exact date.
 */
export function occursOn(mission: Mission, dateKey: string): boolean {
  switch (mission.repeat) {
    case 'diaria':
      return true
    case 'semanal':
      return weekdayIndex(dateKey) === weekdayIndex(mission.date)
    case 'mensual':
      return dayOfMonth(dateKey) === dayOfMonth(mission.date)
    default:
      return dateKey === mission.date
  }
}

export interface DayCellState {
  /** Show a filled check — completed (one-off) or completed this cycle (repeating). */
  done: boolean
  /** Tappable to complete right now (only today's still-pending occurrences). */
  actionable: boolean
}

/**
 * How a mission should render on a specific day cell. Only today's pending
 * occurrences are actionable; past days reflect what was done, future days are
 * read-only previews of the routine.
 */
export function dayCellState(mission: Mission, dateKey: string, today = todayKey()): DayCellState {
  if (dateKey === today) {
    const done = isDoneForNow(mission, today)
    return { done, actionable: !done }
  }
  if (dateKey < today) {
    const done = isRepeating(mission) ? mission.lastCompletedOn === dateKey : mission.status === 'completada'
    return { done, actionable: false }
  }
  return { done: false, actionable: false }
}

/** Missions occurring on a day, timed ones first (sorted by time), then untimed. */
export function missionsForDay(missions: Mission[], dateKey: string): Mission[] {
  return missions
    .filter((m) => occursOn(m, dateKey))
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
}

export { dateKeyOf }
