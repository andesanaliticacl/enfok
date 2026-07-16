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

/** Generated pixel-art scenery for a biome — full-bleed background, light or dark time of day. */
export function biomeBackgroundUrl(id: BiomeId, variant: BiomeVariant): string {
  return `/assets/biomes/${id}/${variant}.png`
}
