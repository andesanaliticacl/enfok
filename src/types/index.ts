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
