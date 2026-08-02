import type { Biome, BiomeId } from '@/types'
import type { BiomeVariant } from '@/store/useAvatarStore'

/**
 * Six worlds, each with two faces. The day/night split isn't a recolor — every
 * biome becomes a different place after dark, and all of them are always moving.
 */
export const biomes: Biome[] = [
  {
    id: 'castillo',
    name: 'Castillo',
    emoji: '🏰',
    color: '#b8503f',
    dayName: 'Castillo Celestial',
    nightName: 'Castillo Embrujado',
  },
  {
    id: 'abismo',
    name: 'Abismo',
    emoji: '🔥',
    color: '#ff6a1f',
    dayName: 'El Cielo',
    nightName: 'El Infierno',
  },
  {
    id: 'midgar',
    name: 'Midgar',
    emoji: '🌉',
    color: '#4dd0e1',
    dayName: 'Puente de Neón',
    nightName: 'Puente Tenebroso',
  },
  {
    id: 'cristal',
    name: 'Cristal',
    emoji: '💎',
    color: '#4fe8ff',
    dayName: 'Cueva de Cristal',
    nightName: 'Cueva Abandonada',
  },
  {
    id: 'espacio',
    name: 'Espacio',
    emoji: '🌌',
    color: '#b06bff',
    dayName: 'Sistema Estelar',
    nightName: 'Vacío Profundo',
  },
  {
    id: 'bloques',
    name: 'Bloques',
    emoji: '⛏️',
    color: '#5fa83f',
    dayName: 'Mundo de Bloques',
    nightName: 'Noche de Bloques',
  },
]

export function biomeById(id: BiomeId): Biome | undefined {
  return biomes.find((b) => b.id === id)
}

/** Resolves 'auto' to the real time of day: the world is lit from 07:00 to 19:59 and dark otherwise. */
export function resolveBiomeVariant(variant: BiomeVariant, now = new Date()): 'light' | 'dark' {
  if (variant !== 'auto') return variant
  const hour = now.getHours()
  return hour >= 7 && hour < 20 ? 'light' : 'dark'
}

/** The name the world goes by right now — "El Infierno" after dark, "El Cielo" by day. */
export function biomeVariantName(id: BiomeId, variant: BiomeVariant): string {
  const biome = biomeById(id)
  if (!biome) return ''
  return resolveBiomeVariant(variant) === 'light' ? biome.dayName : biome.nightName
}

/**
 * Biomes retired when the scenery moved from 160x90 pixel art to live SVG
 * scenes — existing saves get mapped onto the closest new world instead of
 * losing their pick.
 */
const RETIRED_BIOMES: Record<string, BiomeId> = {
  valle: 'bloques',
  bosque: 'bloques',
  ciudad: 'midgar',
  playa: 'abismo',
  montana: 'cristal',
}

export function migrateBiomeId(id: string | null | undefined): BiomeId | null {
  if (!id) return null
  if (biomes.some((b) => b.id === id)) return id as BiomeId
  return RETIRED_BIOMES[id] ?? null
}
