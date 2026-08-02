import type { CSSProperties } from 'react'
import { particles } from '@/lib/biome/random'
import type { SceneProps } from './types'

/** Tower footprints reused by both the stone and the roof pass. */
const TOWERS = [
  { x: 36, y: 46, w: 11, h: 26 },
  { x: 49, y: 33, w: 14, h: 39 },
  { x: 97, y: 33, w: 14, h: 39 },
  { x: 113, y: 46, w: 11, h: 26 },
]

/** Castillo Celestial by day — a sunlit fortress above the clouds — and Castillo Embrujado by night. */
export function CastilloScene({ daylight, seedKey }: SceneProps) {
  const stone = daylight ? '#e8dcc4' : '#211a2e'
  const stoneShade = daylight ? '#cdbf9f' : '#171226'
  const roof = daylight ? '#b8503f' : '#2b1b33'
  const trim = daylight ? '#f5ecd8' : '#3a2c4d'

  const clouds = particles(seedKey, 'clouds', 5, (rand, i) => ({
    x: rand() * 140,
    y: 8 + i * 6 + rand() * 4,
    w: 22 + rand() * 26,
    dur: 26 + rand() * 18,
    delay: rand() * 12,
  }))

  const wisps = particles(seedKey, 'wisps', 7, (rand) => ({
    x: 20 + rand() * 120,
    y: 55 + rand() * 25,
    dur: 5 + rand() * 4,
    delay: rand() * 7,
    drift: (rand() - 0.5) * 16,
    r: 1 + rand() * 1.4,
  }))

  const bats = particles(seedKey, 'bats', 4, (rand) => ({
    y: 14 + rand() * 24,
    dur: 9 + rand() * 7,
    delay: rand() * 9,
    s: 0.7 + rand() * 0.6,
  }))

  const windows = particles(seedKey, 'windows', 9, (rand) => ({
    x: 52 + rand() * 56,
    y: 40 + rand() * 24,
    delay: rand() * 5,
  }))

  return (
    <>
      <defs>
        <linearGradient id="cas-sky" x1="0" y1="0" x2="0" y2="1">
          {daylight ? (
            <>
              <stop offset="0%" stopColor="#5fa8e0" />
              <stop offset="55%" stopColor="#bfe0f2" />
              <stop offset="100%" stopColor="#f6d9a0" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#05030d" />
              <stop offset="55%" stopColor="#150f2b" />
              <stop offset="100%" stopColor="#2a1c3d" />
            </>
          )}
        </linearGradient>
        <radialGradient id="cas-orb" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={daylight ? '#fff8dc' : '#e8ecff'} stopOpacity={0.95} />
          <stop offset="100%" stopColor={daylight ? '#ffd98a' : '#8fa3d8'} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="cas-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={daylight ? '#7bab63' : '#150f22'} />
          <stop offset="100%" stopColor={daylight ? '#4d7a44' : '#0a0714'} />
        </linearGradient>
      </defs>

      <rect width="160" height="90" fill="url(#cas-sky)" />

      {/* Sun or moon */}
      <circle cx={daylight ? 128 : 30} cy={daylight ? 20 : 18} r="18" fill="url(#cas-orb)" />
      <circle
        cx={daylight ? 128 : 30}
        cy={daylight ? 20 : 18}
        r={daylight ? 7 : 6}
        fill={daylight ? '#fff4c9' : '#dfe5ff'}
      />
      {!daylight && <circle cx="27" cy="16" r="2" fill="#c2caea" opacity="0.5" />}

      {/* Drifting clouds — soft by day, tattered wisps at night */}
      {clouds.map((c, i) => (
        <g
          key={`cloud-${i}`}
          className="anim-cloud"
          style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        >
          <ellipse
            cx={c.x}
            cy={c.y}
            rx={c.w / 2}
            ry={3.2}
            fill={daylight ? '#ffffff' : '#3b2f52'}
            opacity={daylight ? 0.75 : 0.4}
          />
          <ellipse
            cx={c.x + c.w / 5}
            cy={c.y - 1.8}
            rx={c.w / 3.4}
            ry={2.6}
            fill={daylight ? '#ffffff' : '#3b2f52'}
            opacity={daylight ? 0.6 : 0.3}
          />
        </g>
      ))}

      {/* Sun rays fanning over the keep (day only) */}
      {daylight &&
        [0, 1, 2].map((i) => (
          <polygon
            key={`ray-${i}`}
            className="anim-ray"
            points={`128,20 ${96 - i * 26},90 ${112 - i * 26},90`}
            fill="#fff6cf"
            opacity="0.25"
            style={{ animationDelay: `${i * 1.4}s` }}
          />
        ))}

      {/* Bats crossing the moon (night only) */}
      {!daylight &&
        bats.map((b, i) => (
          <g
            key={`bat-${i}`}
            className="anim-bird"
            style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
          >
            <path
              d={`M0,${b.y} q2,-2 4,0 q2,-2 4,0 q-2,2 -4,1 q-2,1 -4,-1 z`}
              fill="#0d0818"
              transform={`scale(${b.s})`}
            />
          </g>
        ))}

      {/* Distant hills */}
      <path
        d="M0,72 Q26,60 48,70 Q74,58 96,70 Q124,60 160,71 L160,90 L0,90 Z"
        fill={daylight ? '#8fbd72' : '#120c1e'}
        opacity={daylight ? 0.55 : 1}
      />

      {/* --- Castle --- */}
      <g>
        {/* Towers */}
        {TOWERS.map((t, i) => (
          <rect key={`tower-${i}`} x={t.x} y={t.y} width={t.w} height={t.h} fill={i % 2 === 0 ? stoneShade : stone} />
        ))}
        {/* Conical roofs */}
        {TOWERS.map((t, i) => (
          <polygon
            key={`roof-${i}`}
            points={`${t.x - 1.5},${t.y} ${t.x + t.w / 2},${t.y - 11} ${t.x + t.w + 1.5},${t.y}`}
            fill={roof}
          />
        ))}
        {/* Keep */}
        <rect x="63" y="40" width="34" height="32" fill={stone} />
        {/* Crenellations */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`cren-${i}`} x={63 + i * 6} y="36" width="4" height="4.5" fill={stoneShade} />
        ))}
        {/* Gate */}
        <path d="M74,72 L74,60 Q80,53 86,60 L86,72 Z" fill={daylight ? '#7a5c3a' : '#0a0612'} />
        <path
          d="M76,72 L76,61 Q80,55.5 84,61 L84,72 Z"
          fill={daylight ? '#5d4429' : '#160f24'}
        />
        {/* Banners on the two tall towers */}
        {[56, 104].map((x, i) => (
          <g key={`banner-${i}`}>
            <rect x={x} y="14" width="0.8" height="19" fill={trim} />
            <path
              className="anim-banner"
              d={`M${x + 0.8},15 L${x + 9},17.5 L${x + 0.8},20 Z`}
              fill={daylight ? '#d4af37' : '#5b3f74'}
              style={{ animationDelay: `${i * 0.6}s` } as CSSProperties}
            />
          </g>
        ))}
        {/* Windows — dark slits by day, flickering souls by night */}
        {windows.map((w, i) =>
          daylight ? (
            <rect key={`win-${i}`} x={w.x} y={w.y} width="2" height="3.5" rx="1" fill="#6b5a44" opacity="0.7" />
          ) : (
            <g key={`win-${i}`} className="anim-torch" style={{ animationDelay: `${w.delay}s` }}>
              <rect x={w.x - 1} y={w.y - 1} width="4" height="5.5" rx="1.5" fill="#7de0c0" opacity="0.25" />
              <rect x={w.x} y={w.y} width="2" height="3.5" rx="1" fill="#a8ffe4" />
            </g>
          ),
        )}
      </g>

      {/* Ground */}
      <rect x="0" y="72" width="160" height="18" fill="url(#cas-ground)" />

      {/* Ghost wisps drifting over the grounds (night only) */}
      {!daylight &&
        wisps.map((w, i) => (
          <g
            key={`wisp-${i}`}
            className="anim-wisp"
            style={{ animationDuration: `${w.dur}s`, animationDelay: `${w.delay}s`, '--drift': `${w.drift}px` } as CSSProperties}
          >
            <circle cx={w.x} cy={w.y} r={w.r * 2.6} fill="#8ff0d4" opacity="0.16" />
            <circle cx={w.x} cy={w.y} r={w.r} fill="#d6fff2" opacity="0.85" />
          </g>
        ))}

      {/* Ground fog */}
      <ellipse
        className="anim-fog"
        cx="80"
        cy="76"
        rx="90"
        ry="6"
        fill={daylight ? '#ffffff' : '#6f5f96'}
        opacity={daylight ? 0.2 : 0.28}
      />
    </>
  )
}
