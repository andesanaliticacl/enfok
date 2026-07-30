import type { MuscleGroup } from '@/types'

export interface MuscleGroupDef {
  id: MuscleGroup
  label: string
  icon: string
  /** Which side of the body silhouette shows this group — null for groups that don't map onto the body (e.g. cardio, abs-of-all-trades). */
  view: 'frente' | 'espalda' | null
  /** One point per bilateral side, in the 0-200 x 0-360 viewBox the BodyMap silhouette uses. */
  positions: { x: number; y: number }[]
}

/** The same silhouette is reused for both views — only which markers render changes, since front/back muscles largely share the same limb positions. */
export const MUSCLE_GROUPS: MuscleGroupDef[] = [
  { id: 'hombros', label: 'Hombros', icon: '🔺', view: 'frente', positions: [{ x: 52, y: 68 }, { x: 148, y: 68 }] },
  { id: 'pecho', label: 'Pecho', icon: '🛡️', view: 'frente', positions: [{ x: 100, y: 95 }] },
  { id: 'biceps', label: 'Bíceps', icon: '💪', view: 'frente', positions: [{ x: 46, y: 105 }, { x: 154, y: 105 }] },
  { id: 'cuadriceps', label: 'Cuádriceps', icon: '🦵', view: 'frente', positions: [{ x: 85, y: 225 }, { x: 115, y: 225 }] },

  { id: 'espalda', label: 'Espalda', icon: '🦾', view: 'espalda', positions: [{ x: 100, y: 90 }] },
  { id: 'triceps', label: 'Tríceps', icon: '💪', view: 'espalda', positions: [{ x: 46, y: 105 }, { x: 154, y: 105 }] },
  { id: 'lumbar', label: 'Lumbar', icon: '🔻', view: 'espalda', positions: [{ x: 100, y: 155 }] },
  { id: 'femoral', label: 'Femoral', icon: '🦵', view: 'espalda', positions: [{ x: 85, y: 225 }, { x: 115, y: 225 }] },

  { id: 'otros', label: 'Otros', icon: '⚡', view: null, positions: [] },
]

export function muscleGroup(id: MuscleGroup): MuscleGroupDef {
  return MUSCLE_GROUPS.find((g) => g.id === id) ?? MUSCLE_GROUPS[MUSCLE_GROUPS.length - 1]
}
