import type { RegionCategory } from '@/types'

export interface RegionCategoryDef {
  id: RegionCategory
  label: string
  icon: string
  color: string
  description: string
}

/** The kinds of real-life places a region can be — each with its default look. */
export const REGION_CATEGORIES: RegionCategoryDef[] = [
  { id: 'casa', label: 'Casa', icon: '🏠', color: '#d46a8a', description: 'Hábitos del hogar y vida personal.' },
  { id: 'trabajo', label: 'Trabajo', icon: '💼', color: '#4a7fd4', description: 'Carrera y proyectos profesionales.' },
  { id: 'gimnasio', label: 'Gimnasio', icon: '💪', color: '#d47a4a', description: 'Entrenamiento y salud física.' },
  { id: 'universidad', label: 'Universidad', icon: '🎓', color: '#8a5fc9', description: 'Estudio y nuevas habilidades.' },
  { id: 'banco', label: 'Banco', icon: '🏦', color: '#d4af37', description: 'Finanzas, ahorro e inversión.' },
  { id: 'parque', label: 'Parque', icon: '🌳', color: '#4a9b6e', description: 'Aire libre, deporte y descanso.' },
  { id: 'otro', label: 'Otro', icon: '📍', color: '#4bb3c9', description: 'Cualquier otro lugar importante.' },
]

export function regionCategory(id: RegionCategory): RegionCategoryDef {
  return REGION_CATEGORIES.find((c) => c.id === id) ?? REGION_CATEGORIES[REGION_CATEGORIES.length - 1]
}
