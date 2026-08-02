import type { CSSProperties } from 'react'
import { particles } from '@/lib/biome/random'
import type { SceneProps } from './types'

/** A cavern that blazes with crystal light by day and falls to an abandoned, dripping dark by night. */
export function CristalScene({ daylight, seedKey }: SceneProps) {
  const rock = daylight ? '#3b3350' : '#0c0a14'
  const rockLit = daylight ? '#4e4468' : '#141020'

  const crystals = particles(seedKey, 'crystals', 11, (rand) => ({
    x: 8 + rand() * 144,
    baseY: 66 + rand() * 14,
    h: 8 + rand() * 20,
    w: 2.5 + rand() * 3.5,
    tilt: (rand() - 0.5) * 10,
    delay: rand() * 4,
    cyan: rand() > 0.45,
  }))

  const stalactites = particles(seedKey, 'stalactites', 12, (rand, i) => ({
    x: 4 + i * 13 + rand() * 5,
    h: 6 + rand() * 14,
    w: 3 + rand() * 3,
  }))

  // Tiny, bright, unhurried — a diamond-glint appearance rather than a shimmer.
  const sparkles = particles(seedKey, 'sparkles', 20, (rand) => ({
    x: rand() * 160,
    y: 18 + rand() * 64,
    r: 0.35 + rand() * 0.55,
    dur: 7 + rand() * 10,
    delay: rand() * 12,
  }))

  const drips = particles(seedKey, 'drips', 5, (rand, i) => ({
    x: 18 + i * 30 + rand() * 10,
    y: 14 + rand() * 10,
    fall: 24 + rand() * 20,
    delay: rand() * 4,
  }))

  return (
    <>
      <defs>
        <radialGradient id="cri-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={daylight ? '#9ff5ff' : '#3a5a6e'} stopOpacity={daylight ? 0.6 : 0.35} />
          <stop offset="100%" stopColor={daylight ? '#5b7cff' : '#0a0f18'} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="cri-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={daylight ? '#1c1830' : '#040308'} />
          <stop offset="60%" stopColor={daylight ? '#2a2445' : '#080610'} />
          <stop offset="100%" stopColor={daylight ? '#3b3358' : '#0c0a16'} />
        </linearGradient>
        <linearGradient id="cri-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={daylight ? '#4fd6ec' : '#16303c'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={daylight ? '#1d5f8a' : '#08151c'} />
        </linearGradient>
      </defs>

      <rect width="160" height="90" fill="url(#cri-bg)" />

      {/* Ambient cavern glow */}
      <ellipse cx="80" cy="62" rx="80" ry="34" fill="url(#cri-glow)" className="anim-aura" />

      {/* Ceiling opening — a shaft of daylight pours through by day */}
      {daylight && (
        <>
          <ellipse cx="80" cy="4" rx="20" ry="5" fill="#cfefff" opacity="0.9" />
          <polygon className="anim-ray" points="64,4 96,4 112,80 48,80" fill="#bfe8ff" opacity="0.22" />
          <polygon className="anim-ray" points="72,4 88,4 98,80 62,80" fill="#eaf8ff" opacity="0.18" style={{ animationDelay: '2s' }} />
        </>
      )}

      {/* Cave ceiling */}
      <path d="M0,0 L160,0 L160,14 Q120,26 80,16 Q40,26 0,14 Z" fill={rock} />
      {stalactites.map((s, i) => (
        <polygon
          key={`stal-${i}`}
          points={`${s.x - s.w / 2},14 ${s.x + s.w / 2},14 ${s.x},${14 + s.h}`}
          fill={rockLit}
        />
      ))}

      {/* Cave floor */}
      <path d="M0,90 L0,74 Q40,66 80,72 Q120,66 160,74 L160,90 Z" fill={rock} />

      {/* Underground pool */}
      <ellipse cx="80" cy="84" rx="56" ry="7" fill="url(#cri-water)" />
      {[0, 1, 2].map((i) => (
        <ellipse
          key={`pool-ripple-${i}`}
          className="anim-wave"
          cx="80"
          cy={82 + i * 2}
          rx={44 - i * 12}
          ry="1"
          fill={daylight ? '#a8f0ff' : '#2e5a6e'}
          opacity="0.5"
          style={{ animationDelay: `${i * 1.1}s` }}
        />
      ))}

      {/* Crystal formations */}
      {crystals.map((c, i) => {
        const hue = c.cyan ? '#4fe8ff' : '#b57cff'
        const hueDim = c.cyan ? '#1d4a5c' : '#3a2a55'
        return (
          <g key={`crystal-${i}`} transform={`rotate(${c.tilt} ${c.x} ${c.baseY})`}>
            {/* Glow hugs the crystal — a wide ellipse reads as a bush, not a gleam */}
            <ellipse
              className="anim-crystal"
              cx={c.x}
              cy={c.baseY - c.h / 2}
              rx={c.w * 1.15}
              ry={c.h * 0.55}
              fill={hue}
              opacity={daylight ? 0.28 : 0.14}
              style={{ animationDelay: `${c.delay}s` }}
            />
            <polygon
              points={`${c.x - c.w / 2},${c.baseY} ${c.x + c.w / 2},${c.baseY} ${c.x + c.w / 4},${c.baseY - c.h} ${c.x - c.w / 4},${c.baseY - c.h}`}
              fill={daylight ? hue : hueDim}
              opacity={daylight ? 0.95 : 0.85}
            />
            {/* Facet highlight */}
            <polygon
              points={`${c.x - c.w / 2},${c.baseY} ${c.x - c.w / 8},${c.baseY} ${c.x - c.w / 8},${c.baseY - c.h} ${c.x - c.w / 4},${c.baseY - c.h}`}
              fill="#ffffff"
              opacity={daylight ? 0.45 : 0.12}
            />
          </g>
        )
      })}

      {/* Wall torches — the only real light left at night */}
      {!daylight &&
        [24, 136].map((x, i) => (
          <g key={`torch-${i}`}>
            <rect x={x} y="42" width="1.2" height="6" fill="#2a1e14" />
            {/* Halo stays small — on a 160-wide canvas even r=4 is a big blob */}
            <circle
              className="anim-torch"
              cx={x + 0.6}
              cy="41"
              r="3.4"
              fill="#ff9a2e"
              opacity="0.22"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
            <circle className="anim-torch" cx={x + 0.6} cy="41" r="1.1" fill="#ffd08a" style={{ animationDelay: `${i * 0.9}s` }} />
          </g>
        ))}

      {/* Bats roosting overhead (night) */}
      {!daylight &&
        [0, 1, 2].map((i) => (
          <g key={`bat-${i}`} className="anim-bird" style={{ animationDuration: `${8 + i * 3}s`, animationDelay: `${i * 2.5}s` }}>
            <path d={`M0,${24 + i * 7} q2,-2 4,0 q2,-2 4,0 q-2,2 -4,1 q-2,1 -4,-1 z`} fill="#050308" />
          </g>
        ))}

      {/* Water dripping from the ceiling */}
      {drips.map((d, i) => (
        <circle
          key={`drip-${i}`}
          className="anim-drip"
          cx={d.x}
          cy={d.y}
          r="0.7"
          fill={daylight ? '#bfefff' : '#5a8fa8'}
          style={{ animationDelay: `${d.delay}s`, '--fall': `${d.fall}px` } as CSSProperties}
        />
      ))}

      {/* Diamond-glint motes — small, sharp, and unhurried in both light and dark */}
      {sparkles.map((s, i) => (
        <circle
          key={`sparkle-${i}`}
          className="anim-star-flash"
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={daylight ? '#ffffff' : '#bfe8ff'}
          style={{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </>
  )
}
