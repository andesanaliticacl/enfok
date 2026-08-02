import { layerRandom, particles } from '@/lib/biome/random'
import type { SceneProps } from './types'

const BLOCK = 8
const COLS = 20
const CRAFT_COL = 9

type OreType = 'diamond' | 'coal' | 'lapis'
const ORE_COLOR: Record<OreType, string> = { diamond: '#7ff5ee', coal: '#1a1a1a', lapis: '#2f4fd6' }
const ORE_TYPES: OreType[] = ['diamond', 'coal', 'lapis']

/** A voxel world: sunlit grass, blocky trees and a crafting table by day, torches and shuffling mobs at night. */
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
  const stoneVein = daylight ? '#6a6a6a' : '#1c1c1c'
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

  // Ore veins tucked into the stone layer — a handful of fixed spots so they
  // read clearly rather than a noisy speckle.
  const ores = particles(seedKey, 'ores', 6, (rand, i) => {
    const col = (3 + i * 3 + Math.floor(rand() * 2)) % COLS
    const stoneRows = Math.max(0, heights[col] - 3)
    const row = stoneRows > 0 ? Math.floor(rand() * stoneRows) : 0
    return { col, row, type: ORE_TYPES[i % ORE_TYPES.length] }
  })

  // Mobs burn in daylight — small fires flare where one caught the sun; at
  // night the same spots become the mobs themselves, shuffling across.
  const mobSpots = particles(seedKey, 'mobs', 3, (rand, i) => ({
    col: 4 + i * 6 + Math.floor(rand() * 3),
    dur: 22 + rand() * 14,
    delay: rand() * 12,
    skeleton: i % 2 === 0,
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
        const stoneRows = Math.max(0, h - 3)
        return (
          <g key={`col-${col}`}>
            {/* Grass cap */}
            <rect x={x} y={topY} width={BLOCK} height={BLOCK} fill={grass} />
            <rect x={x} y={topY} width={BLOCK} height={2.5} fill={grassTop} />
            {/* Dirt layers */}
            {Array.from({ length: Math.min(2, h - 1) }, (_, d) => (
              <rect key={`d-${d}`} x={x} y={topY + BLOCK * (d + 1)} width={BLOCK} height={BLOCK} fill={dirt} />
            ))}
            {/* Stone below, with the occasional ore vein */}
            {Array.from({ length: stoneRows }, (_, s) => {
              const y = topY + BLOCK * (s + 3)
              const ore = ores.find((o) => o.col === col && o.row === s)
              return (
                <g key={`s-${s}`}>
                  <rect x={x} y={y} width={BLOCK} height={BLOCK} fill={stone} />
                  {ore && (
                    <g>
                      <circle cx={x + 2.5} cy={y + 3} r="1" fill={ORE_COLOR[ore.type]} />
                      <circle cx={x + 5.2} cy={y + 4.6} r="1" fill={ORE_COLOR[ore.type]} />
                      <circle cx={x + 3.6} cy={y + 6} r="1" fill={ORE_COLOR[ore.type]} />
                    </g>
                  )}
                </g>
              )
            })}
            {/* Block outlines keep the voxel grid readable */}
            <rect x={x} y={topY} width={BLOCK} height={h * BLOCK} fill="none" stroke="#000000" strokeWidth="0.4" opacity="0.16" />
            {/* Faint seams between stone rows */}
            {Array.from({ length: stoneRows }, (_, s) => (
              <line
                key={`seam-${s}`}
                x1={x}
                y1={topY + BLOCK * (s + 3)}
                x2={x + BLOCK}
                y2={topY + BLOCK * (s + 3)}
                stroke={stoneVein}
                strokeWidth="0.3"
                opacity="0.4"
              />
            ))}
          </g>
        )
      })}

      {/* Blocky trees — trunk clearly sticking out beneath the canopy, no floating gap */}
      {trees.map((t, i) => {
        const col = Math.min(t.col, COLS - 2)
        const x = col * BLOCK
        const groundY = 90 - heights[col] * BLOCK
        return (
          <g key={`tree-${i}`}>
            <rect x={x + 2.5} y={groundY - 14} width="3" height="14" fill={trunk} />
            <rect x={x - 6} y={groundY - 22} width="16" height="8" fill={leaves} />
            <rect x={x - 2.5} y={groundY - 28} width="9" height="6" fill={leaves} />
          </g>
        )
      })}

      {/* A crafting table — its 2x2 grid top face is the tell */}
      {(() => {
        const col = CRAFT_COL
        const x = col * BLOCK
        const groundY = 90 - heights[Math.min(col, COLS - 1)] * BLOCK
        const wood = daylight ? '#9c6b3f' : '#2e2013'
        const woodDark = daylight ? '#7a5230' : '#20160d'
        const grid = daylight ? '#d8c39a' : '#4a3a26'
        return (
          <g>
            <rect x={x} y={groundY - BLOCK} width={BLOCK} height={BLOCK} fill={wood} />
            <rect x={x} y={groundY - BLOCK} width={BLOCK} height={BLOCK} fill="none" stroke={woodDark} strokeWidth="0.5" />
            {[0, 1].map((r) =>
              [0, 1].map((c) => (
                <rect
                  key={`craft-${r}-${c}`}
                  x={x + 1 + c * 3.4}
                  y={groundY - BLOCK + 1 + r * 3.4}
                  width="2.6"
                  height="2.6"
                  fill="none"
                  stroke={grid}
                  strokeWidth="0.5"
                />
              )),
            )}
          </g>
        )
      })()}

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

      {/* Mobs burn in the daylight — small fires where the sun caught one; at night they're the mobs themselves */}
      {mobSpots.map((m, i) => {
        const col = Math.min(m.col, COLS - 2)
        const x = col * BLOCK
        const groundY = 90 - heights[col] * BLOCK
        if (daylight) {
          return (
            <g key={`fire-${i}`} className="anim-torch" style={{ animationDelay: `${i * 0.7}s` }}>
              <polygon points={`${x + 4},${groundY} ${x + 1.8},${groundY - 5.5} ${x + 4},${groundY - 3.5} ${x + 6.2},${groundY - 6.5} ${x + 4},${groundY} ${x + 6.5},${groundY}`} fill="#ff7a1f" />
              <polygon points={`${x + 4},${groundY} ${x + 2.8},${groundY - 3} ${x + 4},${groundY - 2} ${x + 5.4},${groundY - 3.6}`} fill="#ffd24a" />
            </g>
          )
        }
        return (
          <g
            key={`mob-${i}`}
            className="anim-mob-walk"
            style={{ animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s` }}
          >
            <g transform={`translate(0, ${groundY - 7})`}>
              {m.skeleton ? (
                <>
                  <rect x="-1.3" y="0" width="2.6" height="4.5" fill="#d8d4c8" />
                  <rect x="-1.6" y="-2.4" width="3.2" height="2.6" fill="#e8e4d8" />
                  <rect x="-1" y="4.5" width="0.9" height="2.5" fill="#c8c4b8" />
                  <rect x="0.1" y="4.5" width="0.9" height="2.5" fill="#c8c4b8" />
                </>
              ) : (
                <>
                  <rect x="-1.4" y="0" width="2.8" height="4.5" fill="#3f7a45" />
                  <rect x="-1.6" y="-2.4" width="3.2" height="2.6" fill="#4f8f52" />
                  <rect x="-1" y="4.5" width="0.9" height="2.5" fill="#2f5a34" />
                  <rect x="0.1" y="4.5" width="0.9" height="2.5" fill="#2f5a34" />
                  <rect x="-2.3" y="0.3" width="0.9" height="3" fill="#3f7a45" />
                </>
              )}
            </g>
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
