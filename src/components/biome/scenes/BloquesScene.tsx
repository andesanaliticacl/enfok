import { layerRandom, particles } from '@/lib/biome/random'
import type { SceneProps } from './types'

const BLOCK = 8
const COLS = 20

/** A voxel world: sunlit grass and blocky trees by day, torch-lit and watched by glowing eyes at night. */
export function BloquesScene({ daylight, seedKey }: SceneProps) {
  // A chunky heightmap — each column's grass line snaps to the block grid.
  const heights = (() => {
    const rand = layerRandom(seedKey, 'terrain')
    let h = 7
    return Array.from({ length: COLS }, () => {
      if (rand() > 0.72) h += rand() > 0.5 ? 1 : -1
      h = Math.max(5, Math.min(8, h))
      return h
    })
  })()

  const grass = daylight ? '#5fa83f' : '#1f3a1c'
  const grassTop = daylight ? '#7cc44f' : '#284a24'
  const dirt = daylight ? '#8a5a3b' : '#2e1e14'
  const stone = daylight ? '#7d7d7d' : '#242424'
  const trunk = daylight ? '#6b4423' : '#241609'
  const leaves = daylight ? '#3f8f2f' : '#16301a'

  const clouds = particles(seedKey, 'clouds', 4, (rand, i) => ({
    x: rand() * 120,
    y: 6 + i * 7,
    blocks: 3 + Math.floor(rand() * 3),
    dur: 30 + rand() * 20,
    delay: rand() * 10,
  }))

  const trees = particles(seedKey, 'trees', 4, (rand, i) => ({
    col: 2 + i * 5 + Math.floor(rand() * 2),
  }))

  const stars = particles(seedKey, 'stars', 22, (rand) => ({
    x: rand() * 160,
    y: rand() * 40,
    dur: 2 + rand() * 3,
    delay: rand() * 4,
  }))

  const eyes = particles(seedKey, 'eyes', 4, (rand, i) => ({
    x: 14 + i * 38 + rand() * 14,
    y: 62 + rand() * 12,
    delay: rand() * 4,
  }))

  return (
    <>
      <defs>
        <linearGradient id="blq-sky" x1="0" y1="0" x2="0" y2="1">
          {daylight ? (
            <>
              <stop offset="0%" stopColor="#4fa8e8" />
              <stop offset="100%" stopColor="#a8dcf5" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#04060f" />
              <stop offset="100%" stopColor="#131a2e" />
            </>
          )}
        </linearGradient>
      </defs>

      <rect width="160" height="90" fill="url(#blq-sky)" />

      {/* Blocky sun / moon — squares, never circles */}
      {daylight ? (
        <rect x="122" y="10" width="14" height="14" fill="#fff3b0" />
      ) : (
        <>
          <rect x="122" y="10" width="12" height="12" fill="#e4e9f5" />
          <rect x="122" y="10" width="4" height="4" fill="#c3cadd" />
          <rect x="130" y="18" width="4" height="4" fill="#c3cadd" />
        </>
      )}

      {/* Night sky pixels */}
      {!daylight &&
        stars.map((s, i) => (
          <rect
            key={`star-${i}`}
            className="anim-twinkle"
            x={Math.round(s.x)}
            y={Math.round(s.y)}
            width="1.5"
            height="1.5"
            fill="#ffffff"
            style={{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
          />
        ))}

      {/* Blocky clouds drifting */}
      {clouds.map((c, i) => (
        <g key={`cloud-${i}`} className="anim-cloud" style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}>
          {Array.from({ length: c.blocks }, (_, b) => (
            <rect
              key={b}
              x={c.x + b * 7}
              y={c.y}
              width="7"
              height="5"
              fill={daylight ? '#ffffff' : '#2b3350'}
              opacity={daylight ? 0.92 : 0.6}
            />
          ))}
          <rect
            x={c.x + 7}
            y={c.y - 4}
            width="7"
            height="4"
            fill={daylight ? '#ffffff' : '#2b3350'}
            opacity={daylight ? 0.8 : 0.5}
          />
        </g>
      ))}

      {/* Terrain columns */}
      {heights.map((h, col) => {
        const x = col * BLOCK
        const topY = 90 - h * BLOCK
        return (
          <g key={`col-${col}`}>
            {/* Grass cap */}
            <rect x={x} y={topY} width={BLOCK} height={BLOCK} fill={grass} />
            <rect x={x} y={topY} width={BLOCK} height={2.5} fill={grassTop} />
            {/* Dirt layers */}
            {Array.from({ length: Math.min(2, h - 1) }, (_, d) => (
              <rect key={`d-${d}`} x={x} y={topY + BLOCK * (d + 1)} width={BLOCK} height={BLOCK} fill={dirt} />
            ))}
            {/* Stone below */}
            {Array.from({ length: Math.max(0, h - 3) }, (_, s) => (
              <rect key={`s-${s}`} x={x} y={topY + BLOCK * (s + 3)} width={BLOCK} height={BLOCK} fill={stone} />
            ))}
            {/* Block outlines keep the voxel grid readable */}
            <rect x={x} y={topY} width={BLOCK} height={h * BLOCK} fill="none" stroke="#000000" strokeWidth="0.4" opacity="0.16" />
          </g>
        )
      })}

      {/* Blocky trees planted on the surface */}
      {trees.map((t, i) => {
        const col = Math.min(t.col, COLS - 2)
        const x = col * BLOCK
        const groundY = 90 - heights[col] * BLOCK
        return (
          <g key={`tree-${i}`}>
            <rect x={x + 2.5} y={groundY - 12} width="3" height="12" fill={trunk} />
            <rect x={x - 6} y={groundY - 24} width="16" height="8" fill={leaves} />
            <rect x={x - 2.5} y={groundY - 30} width="9" height="6" fill={leaves} />
          </g>
        )
      })}

      {/* Torches on the surface — the only safe light at night */}
      {!daylight &&
        [3, 11, 17].map((col, i) => {
          const x = col * BLOCK
          const groundY = 90 - heights[col] * BLOCK
          return (
            <g key={`torch-${i}`}>
              <rect x={x + 3} y={groundY - 6} width="1.4" height="6" fill="#6b4423" />
              {/* Small halo — a torch lights its block, it doesn't glow like a bonfire */}
              <circle
                className="anim-torch"
                cx={x + 3.7}
                cy={groundY - 7.5}
                r="3.6"
                fill="#ffb347"
                opacity="0.18"
                style={{ animationDelay: `${i * 1.1}s` }}
              />
              <rect className="anim-torch" x={x + 2.8} y={groundY - 8.8} width="1.8" height="1.8" fill="#ffd08a" style={{ animationDelay: `${i * 1.1}s` }} />
            </g>
          )
        })}

      {/* Something is watching from the dark */}
      {!daylight &&
        eyes.map((e, i) => (
          <g key={`eyes-${i}`} className="anim-window" style={{ animationDelay: `${e.delay}s` }}>
            <rect x={e.x} y={e.y} width="2.5" height="2" fill="#ff3b30" opacity="0.9" />
            <rect x={e.x + 5} y={e.y} width="2.5" height="2" fill="#ff3b30" opacity="0.9" />
          </g>
        ))}

      {/* Sun-warmed haze over the hills */}
      {daylight && <rect className="anim-fog" x="0" y="52" width="160" height="8" fill="#ffffff" opacity="0.14" />}
    </>
  )
}
