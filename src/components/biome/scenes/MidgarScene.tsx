import { particles } from '@/lib/biome/random'
import type { SceneProps } from './types'

const DECK_Y = 58
const PYLONS = [30, 80, 130]

/** A vast suspension bridge into an industrial megacity — humming with neon by day, a tenebrous crossing by night. */
export function MidgarScene({ daylight, seedKey }: SceneProps) {
  const steel = daylight ? '#4a5568' : '#0d1017'
  const steelLit = daylight ? '#63718a' : '#151b26'

  const skyline = particles(seedKey, 'skyline', 16, (rand, i) => ({
    x: i * 10 + rand() * 4,
    w: 5 + rand() * 6,
    h: 10 + rand() * 26,
  }))

  const lamps = particles(seedKey, 'lamps', 9, (rand, i) => ({
    x: 8 + i * 18,
    delay: rand() * 4,
  }))

  const neon = particles(seedKey, 'neon', 10, (rand) => ({
    x: 6 + rand() * 148,
    y: 26 + rand() * 22,
    w: 3 + rand() * 7,
    delay: rand() * 5,
    color: rand() > 0.5 ? '#4dd0e1' : '#f06292',
  }))

  return (
    <>
      <defs>
        <linearGradient id="mid-sky" x1="0" y1="0" x2="0" y2="1">
          {daylight ? (
            <>
              <stop offset="0%" stopColor="#3d5a80" />
              <stop offset="55%" stopColor="#98a9bd" />
              <stop offset="100%" stopColor="#e0a86a" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#03060b" />
              <stop offset="60%" stopColor="#0a1420" />
              <stop offset="100%" stopColor="#12212e" />
            </>
          )}
        </linearGradient>
        <linearGradient id="mid-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={daylight ? '#3f6079' : '#060c14'} />
          <stop offset="100%" stopColor={daylight ? '#24384a' : '#02050a'} />
        </linearGradient>
      </defs>

      <rect width="160" height="90" fill="url(#mid-sky)" />

      {/* Distant sun / cold moon */}
      <circle cx="126" cy="22" r={daylight ? 8 : 5} fill={daylight ? '#ffd9a0' : '#9fb4d4'} opacity={daylight ? 0.9 : 0.7} />
      <circle cx="126" cy="22" r={daylight ? 18 : 12} fill={daylight ? '#ffd9a0' : '#9fb4d4'} opacity="0.15" className="anim-aura" />

      {/* Occasional lightning behind the city (night) */}
      {!daylight && <rect className="anim-lightning" width="160" height="60" fill="#8fb7e0" opacity="0.5" />}

      {/* City skyline + upper plate */}
      <g opacity={daylight ? 0.85 : 1}>
        {skyline.map((b, i) => (
          <rect key={`bld-${i}`} x={b.x} y={DECK_Y - b.h} width={b.w} height={b.h} fill={steel} />
        ))}
        {/* The plate: a slab suspended over the whole city */}
        <rect x="0" y="26" width="160" height="4" fill={steelLit} />
        <rect x="0" y="30" width="160" height="1.5" fill={daylight ? '#2f3a4a' : '#080c12'} />
      </g>

      {/* Neon signage on the buildings */}
      {neon.map((n, i) => (
        <rect
          key={`neon-${i}`}
          className="anim-neon"
          x={n.x}
          y={n.y}
          width={n.w}
          height="1.4"
          rx="0.7"
          fill={n.color}
          opacity={daylight ? 0.5 : 1}
          style={{ animationDelay: `${n.delay}s` }}
        />
      ))}

      {/* Water below */}
      <rect x="0" y={DECK_Y + 10} width="160" height={90 - DECK_Y - 10} fill="url(#mid-water)" />
      {[0, 1, 2].map((i) => (
        <rect
          key={`ripple-${i}`}
          className="anim-wave"
          x="0"
          y={DECK_Y + 16 + i * 6}
          width="160"
          height="0.8"
          fill={daylight ? '#7fa8c4' : '#2a4a63'}
          opacity="0.5"
          style={{ animationDelay: `${i * 0.9}s` }}
        />
      ))}

      {/* --- Bridge --- */}
      <g>
        {/* Suspension cables between pylons */}
        {[0, 1].map((i) => (
          <path
            key={`cable-${i}`}
            d={`M${PYLONS[i]},18 Q${(PYLONS[i] + PYLONS[i + 1]) / 2},${DECK_Y - 4} ${PYLONS[i + 1]},18`}
            stroke={steelLit}
            strokeWidth="1.2"
            fill="none"
          />
        ))}
        <path d={`M0,${DECK_Y - 12} Q14,${DECK_Y - 2} 30,18`} stroke={steelLit} strokeWidth="1.2" fill="none" />
        <path d={`M160,${DECK_Y - 12} Q146,${DECK_Y - 2} 130,18`} stroke={steelLit} strokeWidth="1.2" fill="none" />

        {/* Vertical hangers */}
        {Array.from({ length: 26 }, (_, i) => 4 + i * 6).map((x) => (
          <line key={`hang-${x}`} x1={x} y1={DECK_Y - 2} x2={x} y2={DECK_Y} stroke={steelLit} strokeWidth="0.4" opacity="0.6" />
        ))}

        {/* Deck */}
        <rect x="0" y={DECK_Y} width="160" height="7" fill={steel} />
        <rect x="0" y={DECK_Y} width="160" height="1" fill={steelLit} />

        {/* Pylons */}
        {PYLONS.map((x, i) => (
          <g key={`pylon-${i}`}>
            <rect x={x - 3} y="14" width="6" height={DECK_Y + 14 - 14} fill={steelLit} />
            <rect x={x - 4.5} y="24" width="9" height="2" fill={steel} />
            <rect x={x - 4.5} y="40" width="9" height="2" fill={steel} />
            {/* Aviation beacon on top */}
            <circle className="anim-beacon" cx={x} cy="13" r="1.6" fill="#ff3b30" style={{ animationDelay: `${i * 0.5}s` }} />
          </g>
        ))}

        {/* Lamp posts along the deck */}
        {lamps.map((l, i) => (
          <g key={`lamp-${i}`}>
            <rect x={l.x} y={DECK_Y - 8} width="0.8" height="8" fill={steelLit} />
            {!daylight && (
              <circle cx={l.x + 0.4} cy={DECK_Y - 8.5} r="2.6" fill="#ffd48a" opacity="0.2" className="anim-torch" style={{ animationDelay: `${l.delay}s` }} />
            )}
            <circle
              className={daylight ? undefined : 'anim-torch'}
              cx={l.x + 0.4}
              cy={DECK_Y - 8.5}
              r="0.9"
              fill={daylight ? '#c9d4e0' : '#ffe0a8'}
              style={{ animationDelay: `${l.delay}s` }}
            />
          </g>
        ))}

        {/* Traffic streaking across the deck */}
        {[0, 1, 2].map((i) => (
          <g key={`traffic-${i}`} className="anim-traffic" style={{ animationDelay: `${i * 2.3}s`, animationDuration: `${6 + i}s` }}>
            <rect x="0" y={DECK_Y + 2} width="7" height="1.4" rx="0.7" fill={daylight ? '#ffffff' : '#ffe08a'} opacity="0.9" />
          </g>
        ))}
        {[0, 1].map((i) => (
          <g
            key={`traffic-back-${i}`}
            className="anim-traffic"
            style={{ animationDelay: `${1 + i * 3}s`, animationDuration: `${8 + i}s`, animationDirection: 'reverse' }}
          >
            <rect x="0" y={DECK_Y + 4.5} width="6" height="1.2" rx="0.6" fill="#ff5a4a" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* Fog rolling under the deck */}
      <ellipse className="anim-fog" cx="80" cy={DECK_Y + 12} rx="100" ry="7" fill={daylight ? '#c9d6e2' : '#3a4a5e'} opacity={daylight ? 0.35 : 0.45} />
      <ellipse className="anim-fog" cx="40" cy={DECK_Y + 18} rx="70" ry="5" fill={daylight ? '#c9d6e2' : '#2a3a4e'} opacity="0.3" style={{ animationDelay: '4s' }} />
    </>
  )
}
