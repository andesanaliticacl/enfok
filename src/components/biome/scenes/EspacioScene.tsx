import { particles } from '@/lib/biome/random'
import type { SceneProps } from './types'

/** Deep space — a ringed world and a living nebula. "Day" is a nearby star flooding the system with light; night is the far side. */
export function EspacioScene({ daylight, seedKey }: SceneProps) {
  const stars = particles(seedKey, 'stars', 46, (rand) => ({
    x: rand() * 160,
    y: rand() * 90,
    r: 0.3 + rand() * 0.9,
    dur: 1.6 + rand() * 3,
    delay: rand() * 4,
  }))

  const asteroids = particles(seedKey, 'asteroids', 7, (rand) => ({
    x: rand() * 160,
    y: 56 + rand() * 28,
    r: 0.8 + rand() * 1.8,
    travel: 20 + rand() * 40,
    dur: 30 + rand() * 25,
  }))

  return (
    <>
      <defs>
        <linearGradient id="esp-bg" x1="0" y1="0" x2="1" y2="1">
          {daylight ? (
            <>
              <stop offset="0%" stopColor="#1a1040" />
              <stop offset="60%" stopColor="#2b1a55" />
              <stop offset="100%" stopColor="#4a2a6b" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#01000a" />
              <stop offset="60%" stopColor="#080418" />
              <stop offset="100%" stopColor="#120a28" />
            </>
          )}
        </linearGradient>
        <radialGradient id="esp-neb-a" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b06bff" stopOpacity={daylight ? 0.55 : 0.35} />
          <stop offset="100%" stopColor="#b06bff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="esp-neb-b" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3fe0d0" stopOpacity={daylight ? 0.45 : 0.28} />
          <stop offset="100%" stopColor="#3fe0d0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="esp-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffbe8" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="esp-planet" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor={daylight ? '#ff9d5c' : '#4a3060'} />
          <stop offset="55%" stopColor={daylight ? '#c96a4a' : '#2c1c3e'} />
          <stop offset="100%" stopColor={daylight ? '#5e2f45' : '#120a1c'} />
        </linearGradient>
      </defs>

      <rect width="160" height="90" fill="url(#esp-bg)" />

      {/* Breathing nebulae */}
      <ellipse className="anim-nebula" cx="34" cy="26" rx="46" ry="26" fill="url(#esp-neb-a)" />
      <ellipse className="anim-nebula" cx="128" cy="62" rx="40" ry="24" fill="url(#esp-neb-b)" style={{ animationDelay: '4s' }} />
      <ellipse className="anim-nebula" cx="96" cy="16" rx="30" ry="14" fill="url(#esp-neb-a)" style={{ animationDelay: '7s' }} />

      {/* Starfield */}
      {stars.map((s, i) => (
        <circle
          key={`star-${i}`}
          className="anim-twinkle"
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#ffffff"
          style={{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        />
      ))}

      {/* A distant spiral galaxy */}
      <g opacity={daylight ? 0.5 : 0.7}>
        <ellipse cx="22" cy="72" rx="11" ry="3.5" fill="#cbb6ff" opacity="0.35" transform="rotate(-20 22 72)" />
        <ellipse cx="22" cy="72" rx="5" ry="1.8" fill="#ffffff" opacity="0.6" transform="rotate(-20 22 72)" />
        <circle cx="22" cy="72" r="1.4" fill="#ffffff" />
      </g>

      {/* The system's star — blazing by day, a distant point at night */}
      <circle cx="140" cy="18" r={daylight ? 26 : 12} fill="url(#esp-star)" className="anim-aura" />
      <circle cx="140" cy="18" r={daylight ? 7 : 2.5} fill="#fffbe8" />

      {/* Ringed planet */}
      <g>
        <ellipse cx="66" cy="52" rx="34" ry="7" fill="none" stroke={daylight ? '#e0b0ff' : '#5a4a78'} strokeWidth="2.4" opacity="0.5" transform="rotate(-16 66 52)" />
        <circle cx="66" cy="52" r="17" fill="url(#esp-planet)" />
        {/* Terminator — the planet's night side */}
        <path d="M66,35 A17,17 0 0,1 66,69 A22,17 0 0,0 66,35 Z" fill="#000000" opacity={daylight ? 0.35 : 0.55} />
        {/* Front half of the ring, drawn over the planet */}
        <path
          d="M32,52 A34,7 0 0,0 100,52"
          fill="none"
          stroke={daylight ? '#e0b0ff' : '#5a4a78'}
          strokeWidth="2.4"
          opacity="0.75"
          transform="rotate(-16 66 52)"
        />
        {/* Atmospheric rim light */}
        <circle cx="66" cy="52" r="17" fill="none" stroke={daylight ? '#ffd0a0' : '#8f7fd0'} strokeWidth="0.8" opacity="0.6" />
      </g>

      {/* A small moon */}
      <circle cx="104" cy="72" r="4" fill={daylight ? '#c9c2d8' : '#3a3450'} />
      <circle cx="102.5" cy="70.5" r="1.2" fill={daylight ? '#a89fc0' : '#2a2440'} />

      {/* Drifting asteroids */}
      {asteroids.map((a, i) => (
        <circle
          key={`ast-${i}`}
          className="anim-orbit"
          cx={a.x}
          cy={a.y}
          r={a.r}
          fill={daylight ? '#8a7f9e' : '#2e2842'}
          style={{ animationDuration: `${a.dur}s`, '--travel': `${a.travel}px` } as React.CSSProperties}
        />
      ))}

      {/* Shooting stars */}
      <line className="anim-shooting-star" x1="10" y1="10" x2="26" y2="20" stroke="#ffffff" strokeWidth="0.7" />
      <line
        className="anim-shooting-star"
        x1="88"
        y1="6"
        x2="100"
        y2="14"
        stroke="#ffffff"
        strokeWidth="0.6"
        style={{ animationDelay: '3.4s', animationDuration: '9s' }}
      />
      <line
        className="anim-shooting-star"
        x1="120"
        y1="46"
        x2="134"
        y2="56"
        stroke="#cfe8ff"
        strokeWidth="0.5"
        style={{ animationDelay: '6.2s', animationDuration: '11s' }}
      />
    </>
  )
}
