import type { MoodKey } from '@/types'

export interface MoodDef {
  key: MoodKey
  label: string
  color: string
  /** Shown under the label — names the feeling without judging it. */
  hint: string
}

/**
 * The four basic emotions of the daily check-in. No "good" or "bad" ones: naming
 * what you feel is the win. Identified by colour rather than a cartoon face —
 * a smiley trivialises the answer, a colour just holds it.
 */
export const MOODS: MoodDef[] = [
  { key: 'alegria', label: 'Alegría', color: '#d4af37', hint: 'Hoy hay luz.' },
  { key: 'pena', label: 'Pena', color: '#4a7fd4', hint: 'Algo pesa.' },
  { key: 'rabia', label: 'Rabia', color: '#c9432f', hint: 'Algo arde.' },
  { key: 'miedo', label: 'Miedo', color: '#8a5fc9', hint: 'Algo inquieta.' },
]

export function moodDef(key: MoodKey): MoodDef {
  return MOODS.find((m) => m.key === key)!
}

/** Corazón granted for showing up and naming how you feel. */
export const MOOD_CHECKIN_HEART = 1
