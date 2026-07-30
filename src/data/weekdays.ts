import type { Weekday } from '@/types'

export interface WeekdayDef {
  id: Weekday
  label: string
  short: string
  /** "Grupo de entreno N" — the number the user thinks of this day as. */
  group: number
}

export const WEEKDAYS: WeekdayDef[] = [
  { id: 'lunes', label: 'Lunes', short: 'Lun', group: 1 },
  { id: 'martes', label: 'Martes', short: 'Mar', group: 2 },
  { id: 'miercoles', label: 'Miércoles', short: 'Mié', group: 3 },
  { id: 'jueves', label: 'Jueves', short: 'Jue', group: 4 },
  { id: 'viernes', label: 'Viernes', short: 'Vie', group: 5 },
  { id: 'sabado', label: 'Sábado', short: 'Sáb', group: 6 },
  { id: 'domingo', label: 'Domingo', short: 'Dom', group: 7 },
]

/** JS's Date#getDay() is 0=domingo..6=sábado — remap to our Monday-first list. */
export function todayWeekday(): Weekday {
  const jsDay = new Date().getDay()
  return WEEKDAYS[(jsDay + 6) % 7].id
}
