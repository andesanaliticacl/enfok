const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export { WEEKDAY_LABELS, MONTH_LABELS }

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
