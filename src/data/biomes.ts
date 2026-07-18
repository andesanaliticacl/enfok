import type { Biome, BiomeId } from '@/types'
import type { BiomeVariant } from '@/store/useAvatarStore'

export const biomes: Biome[] = [
  { id: 'valle', name: 'Valle', emoji: '🏞', color: '#5a9b5f' },
  { id: 'ciudad', name: 'Ciudad', emoji: '🏙', color: '#5a7fa8' },
  { id: 'playa', name: 'Playa', emoji: '🏖', color: '#e0b25a' },
  { id: 'bosque', name: 'Bosque', emoji: '🌲', color: '#3f7a4f' },
  { id: 'montana', name: 'Montaña', emoji: '🏔', color: '#8a8f99' },
  { id: 'espacio', name: 'Espacio', emoji: '🌌', color: '#6a4a9b' },
]

/** Resolves 'auto' to the real time of day: the world is lit from 07:00 to 19:59 and dark otherwise. */
export function resolveBiomeVariant(variant: BiomeVariant, now = new Date()): 'light' | 'dark' {
  if (variant !== 'auto') return variant
  const hour = now.getHours()
  return hour >= 7 && hour < 20 ? 'light' : 'dark'
}

/** Generated pixel-art scenery for a biome — full-bleed background, light or dark time of day. */
export function biomeBackgroundUrl(id: BiomeId, variant: BiomeVariant): string {
  return `/assets/biomes/${id}/${resolveBiomeVariant(variant)}.png`
}
