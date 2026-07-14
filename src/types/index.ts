export type RegionId =
  | 'salud'
  | 'finanzas'
  | 'trabajo'
  | 'aprendizaje'
  | 'relaciones'
  | 'mentalidad'
  | 'proyectos'

export type MissionFrequency =
  | 'unica'
  | 'repetitiva'
  | 'diaria'
  | 'semanal'
  | 'mensual'
  | 'flexible'

export type MissionStatus = 'pendiente' | 'completada'

export type ObjectivePriority = 'baja' | 'media' | 'alta'

export type ObjectiveStatus = 'no_iniciado' | 'en_progreso' | 'completado'

export interface Mission {
  id: string
  objectiveId: string
  title: string
  frequency: MissionFrequency
  status: MissionStatus
  xp: number
  coins: number
  completedAt?: string
}

export interface Objective {
  id: string
  regionId: RegionId
  name: string
  description: string
  dueDate?: string
  priority: ObjectivePriority
  status: ObjectiveStatus
  xpReward: number
  color: string
  icon: string
  missionIds: string[]
}

export interface Region {
  id: RegionId
  name: string
  emoji: string
  color: string
  level: number
  description: string
  objectiveIds: string[]
}

export interface InventoryItem {
  id: string
  name: string
  icon: string
  linkedObjectiveIds: string[]
}

export interface PlayerProfile {
  name: string
  level: number
  xp: number
  xpToNextLevel: number
  coins: number
  streakDays: number
  hoursInvested: number
}
