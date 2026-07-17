export type RegionId =
  | 'salud'
  | 'finanzas'
  | 'trabajo'
  | 'aprendizaje'
  | 'relaciones'
  | 'mentalidad'
  | 'proyectos'

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
}

export interface Region {
  id: RegionId
  name: string
  emoji: string
  color: string
  level: number
  description: string
  goalIds: string[]
}

export interface InventoryItem {
  id: string
  name: string
  icon: string
  linkedGoalIds: string[]
}

export type PlaceCategory = 'casa' | 'trabajo' | 'gimnasio' | 'universidad' | 'parque' | 'otro'

export interface Place {
  id: string
  name: string
  category: PlaceCategory
  lat: number
  lng: number
}

export type BiomeId = 'valle' | 'ciudad' | 'playa' | 'bosque' | 'montana' | 'espacio'

export interface Biome {
  id: BiomeId
  name: string
  emoji: string
  color: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  isUnlocked: (ctx: { missionsCompleted: number; streakDays: number; hoursInvested: number; level: number }) => boolean
}

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
}
