import type { CSSProperties } from 'react'
import { particles } from '@/lib/biome/random'
import type { SceneProps } from './types'

/** The most extreme swing of the set: El Cielo by day, El Infierno by night. */
export function AbismoScene({ daylight, seedKey }: SceneProps) {
  const motes = particles(seedKey, 'motes', 16, (rand) => ({
    x: rand() * 160,
    y: 40 + rand() * 50,
    r: 0.5 + rand() * 1.2,
    dur: 4 + rand() * 5,
    delay: rand() * 8,
    drift: (rand() - 0.5) * 20,
  }))

  const smoke = particles(seedKey, 'smoke', 5, (rand, i) => ({
    x: 16 + i * 32 + rand() * 12,
    dur: 12 + rand() * 8,
    delay: rand() * 10,
    w: 10 + rand() * 12,
  }))

  const platforms = particles(seedKey, 'platforms', 4, (rand, i) => ({
    x: 14 + i * 38 + rand() * 8,
    y: 30 + rand() * 26,
    w: 16 + rand() * 12,
    dur: 18 + rand() * 10,
    delay: rand() * 6,
  }))

  const angels = particles(seedKey, 'angels', 3, (rand, i) => ({
    x: 26 + i * 52 + rand() * 14,
    y: 26 + rand() * 14,
    dur: 4 + rand() * 2,
    delay: rand() * 3,
  }))

  const claws = particles(seedKey, 'claws', 6, (rand, i) => ({
    x: 12 + i * 24 + rand() * 12,
    dur: 6 + rand() * 5,
    delay: rand() * 8,
  }))

  return (
    <>
      <defs>
        <linearGradient id="abi-sky" x1="0" y1="0" x2="0" y2="1">
          {daylight ? (
            <>
              <stop offset="0%" stopColor="#8fd0f5" />
              <stop offset="45%" stopColor="#e6f4ff" />
              <stop offset="100%" stopColor="#fff6de" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#0a0304" />
              <stop offset="45%" stopColor="#2e0709" />
              <stop offset="100%" stopColor="#6b1408" />
            </>
          )}
        </linearGradient>
        <radialGradient id="abi-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={daylight ? '#ffffff' : '#ffb347'} stopOpacity={daylight ? 1 : 0.9} />
          <stop offset="100%" stopColor={daylight ? '#ffe9a8' : '#ff4500'} stopOpacity={0} />
        </radialGradient>
        <linearGradient id="abi-lava" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd24a" />
          <stop offset="45%" stopColor="#ff6a1f" />
          <stop offset="100%" stopColor="#a81b04" />
        </linearGradient>
      </defs>

      <rect width="160" height="90" fill="url(#abi-sky)" />

      {/* The source: a radiant sun above, or the molten heart below */}
      <circle cx="80" cy={daylight ? 20 : 84} r={daylight ? 30 : 46} fill="url(#abi-core)" className="anim-aura" />
      {daylight && <circle cx="80" cy="20" r="9" fill="#ffffff" />}

      {/* Heaven's light shafts / Hell's rising heat columns */}
      {[0, 1, 2, 3].map((i) => (
        <polygon
          key={`shaft-${i}`}
          className="anim-ray"
          points={
            daylight
              ? `80,20 ${8 + i * 40},90 ${28 + i * 40},90`
              : `${18 + i * 40},90 ${10 + i * 40},34 ${26 + i * 40},34`
          }
          fill={daylight ? '#ffffff' : '#ff5a1f'}
          opacity={daylight ? 0.35 : 0.18}
          style={{ animationDelay: `${i * 1.1}s` }}
        />
      ))}

      {daylight ? (
        <>
          {/* Floating cloud platforms */}
          {platforms.map((p, i) => (
            <g
              key={`plat-${i}`}
              className="anim-cloud"
              style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
            >
              <ellipse cx={p.x} cy={p.y} rx={p.w} ry={3.5} fill="#ffffff" opacity="0.9" />
              <ellipse cx={p.x - p.w / 3} cy={p.y - 2.5} rx={p.w / 2.4} ry={2.8} fill="#ffffff" opacity="0.75" />
              <ellipse cx={p.x + p.w / 3} cy={p.y - 2} rx={p.w / 2.8} ry={2.4} fill="#ffffff" opacity="0.7" />
            </g>
          ))}

          {/* The golden gate */}
          <g>
            <rect x="66" y="52" width="3.5" height="30" fill="#e8c34a" />
            <rect x="90.5" y="52" width="3.5" height="30" fill="#e8c34a" />
            <path d="M66,52 Q80,34 94,52 L90.5,52 Q80,39 69.5,52 Z" fill="#f5dd7c" />
            <circle cx="80" cy="42" r="3" fill="#fff8dc" className="anim-glow-pulse" />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={`bar-${i}`} x={70.5 + i * 4.2} y="56" width="1.4" height="26" fill="#e8c34a" opacity="0.75" />
            ))}
          </g>

          {/* Cloud floor */}
          <ellipse cx="80" cy="88" rx="110" ry="10" fill="#ffffff" opacity="0.95" />
          <ellipse className="anim-fog" cx="40" cy="84" rx="46" ry="6" fill="#ffffff" opacity="0.6" />
          <ellipse className="anim-fog" cx="120" cy="86" rx="50" ry="6" fill="#ffffff" opacity="0.55" style={{ animationDelay: '3s' }} />

          {/* Angels drifting near the gate, halos and wings gently bobbing */}
          {angels.map((a, i) => (
            <g
              key={`angel-${i}`}
              className="anim-angel"
              style={
                {
                  transformBox: 'fill-box',
                  transformOrigin: '50% 100%',
                  animationDuration: `${a.dur}s`,
                  animationDelay: `${a.delay}s`,
                } as CSSProperties
              }
            >
              <ellipse cx={a.x - 2.2} cy={a.y + 0.6} rx="2.2" ry="1" fill="#fff6de" opacity="0.85" transform={`rotate(-20 ${a.x - 2.2} ${a.y + 0.6})`} />
              <ellipse cx={a.x + 2.2} cy={a.y + 0.6} rx="2.2" ry="1" fill="#fff6de" opacity="0.85" transform={`rotate(20 ${a.x + 2.2} ${a.y + 0.6})`} />
              <ellipse cx={a.x} cy={a.y + 0.4} rx="1.1" ry="0.4" fill="#f5e6a8" opacity="0.9" />
              <polygon points={`${a.x - 1.1},${a.y + 3.4} ${a.x + 1.1},${a.y + 3.4} ${a.x + 1.7},${a.y - 0.6} ${a.x - 1.7},${a.y - 0.6}`} fill="#fffaf0" />
              <circle cx={a.x} cy={a.y - 1.6} r="1" fill="#ffe9c2" />
            </g>
          ))}
        </>
      ) : (
        <>
          {/* Jagged obsidian spires */}
          <path d="M0,90 L0,58 L10,44 L20,60 L30,38 L42,62 L52,52 L60,90 Z" fill="#100405" />
          <path d="M160,90 L160,54 L150,40 L140,58 L128,36 L116,60 L106,50 L100,90 Z" fill="#100405" />
          <path d="M60,90 L66,66 L74,74 L80,58 L88,74 L96,66 L100,90 Z" fill="#1a0708" />

          {/* Tiny horned watchers peering over the spires */}
          {[[16, 46], [144, 42]].map(([x, y], i) => (
            <g key={`imp-${i}`}>
              <polygon points={`${x - 1.6},${y + 1.4} ${x - 2.4},${y - 0.6} ${x - 0.6},${y + 0.4}`} fill="#1a0708" />
              <polygon points={`${x + 1.6},${y + 1.4} ${x + 2.4},${y - 0.6} ${x + 0.6},${y + 0.4}`} fill="#1a0708" />
              <circle cx={x} cy={y + 1.6} r="1.6" fill="#0c0304" />
              <circle className="anim-torch" cx={x - 0.5} cy={y + 1.4} r="0.35" fill="#ff5a1f" style={{ animationDelay: `${i * 0.6}s` }} />
              <circle className="anim-torch" cx={x + 0.5} cy={y + 1.4} r="0.35" fill="#ff5a1f" style={{ animationDelay: `${i * 0.6}s` }} />
            </g>
          ))}

          {/* Lava lake with a pulsing glow */}
          <rect x="0" y="80" width="160" height="10" fill="url(#abi-lava)" className="anim-lava" />
          <rect x="0" y="79" width="160" height="1.5" fill="#ffd98a" opacity="0.8" className="anim-lava" style={{ animationDelay: '0.8s' }} />

          {/* Clawed hands straining up from the lava, then sinking back under */}
          {claws.map((c, i) => (
            <path
              key={`claw-${i}`}
              className="anim-lava-reach"
              d={`M${c.x - 1.4},80 L${c.x - 1},76 L${c.x - 0.6},77.4 L${c.x - 0.25},75.6 L${c.x},77.2 L${c.x + 0.25},75.6 L${c.x + 0.6},77.4 L${c.x + 1},76 L${c.x + 1.4},80 Z`}
              fill="#1a0403"
              style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` } as CSSProperties}
            />
          ))}

          {/* Glowing cracks climbing the rock */}
          {[
            'M14,90 L18,74 L15,66',
            'M46,90 L44,76 L48,68',
            'M112,90 L116,72 L113,64',
            'M142,90 L138,78 L141,70',
          ].map((d, i) => (
            <path
              key={`crack-${i}`}
              className="anim-lava"
              d={d}
              stroke="#ff6a1f"
              strokeWidth="1.2"
              fill="none"
              opacity="0.9"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          ))}

          {/* Smoke columns */}
          {smoke.map((s, i) => (
            <ellipse
              key={`smoke-${i}`}
              className="anim-fog"
              cx={s.x}
              cy={62}
              rx={s.w}
              ry={14}
              fill="#1b0d0d"
              opacity="0.5"
              style={{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
            />
          ))}
        </>
      )}

      {/* Motes: souls ascending in heaven, embers in hell */}
      {motes.map((m, i) => (
        <circle
          key={`mote-${i}`}
          className="anim-spark"
          cx={m.x}
          cy={m.y}
          r={m.r}
          fill={daylight ? '#ffffff' : '#ffae42'}
          opacity={daylight ? 0.9 : 1}
          style={{ animationDuration: `${m.dur}s`, animationDelay: `${m.delay}s`, '--drift': `${m.drift}px` } as CSSProperties}
        />
      ))}
    </>
  )
}
