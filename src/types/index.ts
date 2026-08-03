/** Regions are user-created places (casa, gimnasio, banco...), so ids are free-form. */
export type RegionId = string

export type RegionCategory = 'casa' | 'trabajo' | 'gimnasio' | 'universidad' | 'banco' | 'parque' | 'otro'

export type Priority = 'baja' | 'media' | 'alta'

export type MissionRepeat = 'ninguna' | 'diaria' | 'semanal' | 'mensual' | 'personalizada'

export type MissionStatus = 'pendiente' | 'completada'

export type GoalStatus = 'no_iniciado' | 'en_progreso' | 'completado'

export interface MissionLocation {
  address: string
  lat: number
  lng: number
}

export interface Mission {
  id: string
  goalId: string
  title: string
  description: string
  /** ISO date (yyyy-mm-dd). Mandatory — every mission lives on the calendar. */
  date: string
  time?: string
  priority: Priority
  status: MissionStatus
  xp: number
  coins: number
  estimatedMinutes?: number
  tags: string[]
  repeat: MissionRepeat
  completedAt?: string
  /** Total times this mission was completed — a repeating habit accumulates one per occurrence. */
  completedCount?: number
  /** ISO date (yyyy-mm-dd) of the most recent completion. */
  lastCompletedOn?: string
  location?: MissionLocation
  /** Which of the five player stats this mission bumps on completion — overrides the region-based guess. Undefined = infer from the goal's region. */
  statFocus?: PlayerStatKey
}

export interface Goal {
  id: string
  regionId: RegionId
  name: string
  description: string
  category: string
  startDate?: string
  dueDate?: string
  priority: Priority
  status: GoalStatus
  xpReward: number
  reward?: string
  color: string
  icon: string
  missionIds: string[]
  location?: MissionLocation
  /** Set when this goal was generated from an express plan template. */
  planId?: string
}

/** A region is a real place in the player's life where goals arise: home, gym, bank, campus... */
export interface Region {
  id: RegionId
  name: string
  category: RegionCategory
  emoji: string
  color: string
  level: number
  description: string
  goalIds: string[]
  /** Real map position. Legacy regions from the fixed-region era may lack one — they fall back to the ring layout around the world anchor. */
  lat?: number
  lng?: number
}

export type BiomeId = 'castillo' | 'abismo' | 'midgar' | 'cristal' | 'espacio' | 'bloques'

export interface Biome {
  id: BiomeId
  name: string
  emoji: string
  color: string
  /** What the world becomes from 07:00 to 19:59. */
  dayName: string
  /** …and what it turns into after dark. */
  nightName: string
}

export interface AchievementContext {
  missionsCompleted: number
  streakDays: number
  hoursInvested: number
  level: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  /** Coins granted once when the player claims the unlocked achievement. */
  coinReward: number
  isUnlocked: (ctx: AchievementContext) => boolean
  /** Current vs. target toward unlocking — powers the "almost there" progress bar. */
  progress?: (ctx: AchievementContext) => { current: number; target: number }
}

/** Per-day activity totals, keyed by ISO date (yyyy-mm-dd) — powers the weekly strip and history. */
export type ActivityLog = Record<string, { xp: number; missions: number }>

export type FinanceEntryType = 'ingreso' | 'gasto'

/** The currencies an amount can be entered in — always convertible to a CLP-equivalent for totals. */
export type Currency = 'CLP' | 'USD'

export interface FinanceEntry {
  id: string
  type: FinanceEntryType
  amount: number
  currency: Currency
  description: string
  /** ISO date (yyyy-mm-dd). */
  date: string
}

/** A recurring monthly amount — salary, a side gig, rent income — counted every month without re-entering it. */
export interface IncomeSource {
  id: string
  name: string
  amount: number
  currency: Currency
}

/** A recurring monthly bill — luz, agua, arriendo, gastos comunes — counted every month without re-entering it. */
export interface FixedExpense {
  id: string
  name: string
  amount: number
  currency: Currency
}

export type GroceryCategory =
  | 'carnes'
  | 'lacteos'
  | 'huevos'
  | 'vegetales'
  | 'frutas'
  | 'granos'
  | 'congelados'
  | 'suplementos'
  | 'limpieza'
  | 'dulces'
  | 'otros'

export interface GroceryItem {
  id: string
  name: string
  /** Cuántas unidades llevas — el total de la línea es quantity × price. */
  quantity: number
  category: GroceryCategory
  /** Precio por UNIDAD, no el total: se multiplica por quantity. */
  price?: number
  checked: boolean
}

export type MuscleGroup =
  | 'pecho'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'espalda'
  | 'cuadriceps'
  | 'femoral'
  | 'lumbar'
  | 'otros'

/** One logged set — a specific day you trained this exercise, with the weight and reps you did. */
export interface ExerciseLog {
  id: string
  /** ISO date (yyyy-mm-dd). */
  date: string
  weight: number
  reps: number
}

/** A weekly training split slot — "Grupo de entreno 1" is lunes, "2" is martes, and so on. */
export type Weekday = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

export interface ExerciseItem {
  id: string
  name: string
  muscleGroup: MuscleGroup
  /** Which day(s) of the weekly split this exercise belongs to — an exercise can repeat on more than one day. */
  trainingDays: Weekday[]
  /** Every logged session for this exercise — the personal best and last-trained date are derived from it. */
  logs: ExerciseLog[]
}

/** The five life-facets a completed mission feeds — the player's dashboard next to their character. */
export type PlayerStatKey = 'cuerpo' | 'disciplina' | 'mente' | 'finanzas' | 'corazon'

export type PlayerStats = Record<PlayerStatKey, number>

export interface PlayerProfile {
  name: string
  level: number
  xp: number
  xpToNextLevel: number
  coins: number
  streakDays: number
  hoursInvested: number
  /** ISO date (yyyy-mm-dd) of the last day a mission was completed — anchors the streak. */
  lastActivityDate?: string
  /** XP earned on `xpTodayDate`; stale when the date rolls over (read via xpEarnedToday). */
  xpToday?: number
  xpTodayDate?: string
  /** Daily XP target, Duolingo-style. */
  dailyXpGoal?: number
  /** Cuerpo/Disciplina/Mente/Finanzas/Corazón — accumulated from completed missions by the region they happened in. */
  stats?: PlayerStats
}

/** Inventory modules the player can switch on — Enfok starts lean and grows with what you actually use. */
export type InventoryModuleId = 'finanzas' | 'compras' | 'ejercicios' | 'sistemas'

export type MoodKey = 'pena' | 'rabia' | 'miedo' | 'alegria'

/** One daily emotional check-in. Feeds the Corazón stat and the bitácora. */
export interface MoodEntry {
  id: string
  /** ISO date (yyyy-mm-dd) — one check-in per day. */
  date: string
  mood: MoodKey
  note?: string
}

/** A free-text entry the player writes into the bitácora themselves. */
export interface JournalNote {
  id: string
  /** ISO date (yyyy-mm-dd). */
  date: string
  text: string
}

/** Alguien de tu equipo. Una misma persona puede cumplir varios roles según la etapa. */
export interface Person {
  id: string
  name: string
  roles: string[]
}

export interface SystemStep {
  id: string
  label: string
  note?: string
  /** Quién responde por esta etapa — sin dueño, el paso se cae. */
  personId?: string
  /** Cuál de sus roles cumple aquí (una persona puede ser Editor en un paso y Comercial en otro). */
  role?: string
}

/**
 * A repeatable process drawn as boxes joined by arrows — "sistema de contenido",
 * "sistema comercial". The point is seeing the whole machine at once so you can
 * run it again without rebuilding it from scratch.
 */
export interface LifeSystem {
  id: string
  name: string
  icon: string
  color: string
  steps: SystemStep[]
  /** The last step feeds the first — the system compounds instead of ending. */
  loops: boolean
}
