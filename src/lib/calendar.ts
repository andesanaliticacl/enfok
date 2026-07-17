const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export { WEEKDAY_LABELS, MONTH_LABELS }

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function dateKeyOf(date: Date): string {
  return toDateKey(date.getFullYear(), date.getMonth(), date.getDate())
}

export function todayKey(): string {
  return dateKeyOf(new Date())
}

export function addDaysToKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return dateKeyOf(new Date(y, m - 1, d + days))
}

/** Whole days from `a` to `b` (positive when `b` is after `a`). */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86_400_000)
}

export interface MonthCell {
  day: number | null
  dateKey: string | null
}

/** Builds a 7-column grid for the given month, Monday-first, with leading/trailing blanks. */
export function buildMonthGrid(year: number, month: number): MonthCell[] {
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: MonthCell[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null, dateKey: null })
  for (let day = 1; day <= daysInMonth; day++) cells.push({ day, dateKey: toDateKey(year, month, day) })
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null })

  return cells
}
