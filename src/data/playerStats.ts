import type { PlayerStatKey, RegionCategory } from '@/types'

export interface PlayerStatDef {
  key: PlayerStatKey
  label: string
  icon: string
  color: string
  description: string
}

/** The five-facet dashboard shown next to the character — one clean word each. */
export const PLAYER_STATS: PlayerStatDef[] = [
  { key: 'cuerpo', label: 'Cuerpo', icon: '🤸', color: '#d47a4a', description: 'Energía física, salud y vitalidad.' },
  { key: 'disciplina', label: 'Disciplina', icon: '⚡', color: '#d4af37', description: 'Ejecución, constancia y enfoque.' },
  { key: 'mente', label: 'Mente', icon: '🧠', color: '#8a5fc9', description: 'Conocimiento, habilidades y aprendizaje.' },
  { key: 'finanzas', label: 'Finanzas', icon: '💰', color: '#4a9b6e', description: 'Estabilidad, control y crecimiento económico.' },
  { key: 'corazon', label: 'Corazón', icon: '❤️', color: '#d46a8a', description: 'Paz mental, emociones y relaciones clave.' },
]

export function playerStatDef(key: PlayerStatKey): PlayerStatDef {
  return PLAYER_STATS.find((s) => s.key === key)!
}

/**
 * Which stat a completed mission feeds, derived from the region (real place)
 * its goal lives in — no extra tagging needed per mission. Missions with no
 * traceable region (shouldn't normally happen) fall back to Disciplina, since
 * showing up and doing the thing is always at least that.
 */
export function statForRegionCategory(category: RegionCategory): PlayerStatKey {
  switch (category) {
    case 'gimnasio':
    case 'parque':
      return 'cuerpo'
    case 'universidad':
      return 'mente'
    case 'banco':
      return 'finanzas'
    case 'casa':
      return 'corazon'
    case 'trabajo':
    case 'otro':
    default:
      return 'disciplina'
  }
}

export const EMPTY_PLAYER_STATS: Record<PlayerStatKey, number> = {
  cuerpo: 0,
  disciplina: 0,
  mente: 0,
  finanzas: 0,
  corazon: 0,
}
