import type { PlaceCategory } from '@/types'

export const PLACE_CATEGORIES: { id: PlaceCategory; label: string; icon: string }[] = [
  { id: 'casa', label: 'Casa', icon: '🏠' },
  { id: 'trabajo', label: 'Trabajo', icon: '💼' },
  { id: 'gimnasio', label: 'Gimnasio', icon: '💪' },
  { id: 'universidad', label: 'Universidad', icon: '🎓' },
  { id: 'parque', label: 'Parque', icon: '🌳' },
  { id: 'otro', label: 'Otro', icon: '📍' },
]

export function placeIcon(category: PlaceCategory): string {
  return PLACE_CATEGORIES.find((c) => c.id === category)?.icon ?? '📍'
}
