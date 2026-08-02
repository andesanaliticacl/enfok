import { AbismoScene } from './AbismoScene'
import { BloquesScene } from './BloquesScene'
import { CastilloScene } from './CastilloScene'
import { CristalScene } from './CristalScene'
import { EspacioScene } from './EspacioScene'
import { MidgarScene } from './MidgarScene'
import { SCENE_H, SCENE_W } from './types'
import type { BiomeId } from '@/types'

interface BiomeSceneProps {
  biomeId: BiomeId
  daylight: boolean
  seedKey: string
}

/**
 * Biome scenery is drawn as SVG rather than loaded as art, so it stays crisp at
 * any size and each biome can swing dramatically between its day and night
 * personality (a celestial castle becomes a haunted one; heaven becomes hell).
 * `slice` makes it behave like `background-size: cover`.
 */
export function BiomeScene({ biomeId, daylight, seedKey }: BiomeSceneProps) {
  const props = { daylight, seedKey }

  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {biomeId === 'castillo' && <CastilloScene {...props} />}
      {biomeId === 'abismo' && <AbismoScene {...props} />}
      {biomeId === 'midgar' && <MidgarScene {...props} />}
      {biomeId === 'cristal' && <CristalScene {...props} />}
      {biomeId === 'espacio' && <EspacioScene {...props} />}
      {biomeId === 'bloques' && <BloquesScene {...props} />}
    </svg>
  )
}
