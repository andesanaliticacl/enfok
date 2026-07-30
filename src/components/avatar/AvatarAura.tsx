import type { ReactNode } from 'react'

interface AuraSpec {
  /** Two-stop radial glow behind the character. */
  inner: string
  outer: string
  /** Small floating particles orbiting the character, if the aura has them. */
  particles?: { emoji: string; positions: { x: number; y: number; delay: number }[] }
}

/** Visuals per shop aura id — CSS-only so auras cost nothing to render. */
const AURAS: Record<string, AuraSpec> = {
  'aura:dorada': { inner: 'rgba(242,204,109,0.55)', outer: 'rgba(242,204,109,0)' },
  'aura:esmeralda': { inner: 'rgba(52,153,110,0.55)', outer: 'rgba(52,153,110,0)' },
  'aura:fuego': {
    inner: 'rgba(230,120,50,0.6)',
    outer: 'rgba(200,60,30,0)',
    particles: {
      emoji: '🔥',
      positions: [
        { x: 12, y: 70, delay: 0 },
        { x: 82, y: 62, delay: 1.1 },
        { x: 50, y: 88, delay: 2.2 },
      ],
    },
  },
  'aura:sombria': { inner: 'rgba(110,70,160,0.6)', outer: 'rgba(60,30,90,0)' },
  'aura:estelar': {
    inner: 'rgba(120,130,230,0.5)',
    outer: 'rgba(120,130,230,0)',
    particles: {
      emoji: '✦',
      positions: [
        { x: 8, y: 25, delay: 0 },
        { x: 88, y: 18, delay: 0.8 },
        { x: 15, y: 78, delay: 1.6 },
        { x: 85, y: 70, delay: 2.4 },
        { x: 50, y: 5, delay: 3.2 },
      ],
    },
  },
}

/** Wraps the profile avatar with its equipped aura. Renders children untouched when no aura (or an unknown id) is equipped. */
export function AvatarAura({ auraId, children }: { auraId: string | null; children: ReactNode }) {
  const spec = auraId ? AURAS[auraId] : undefined
  if (!spec) return <>{children}</>

  return (
    <div className="relative">
      <div
        aria-hidden
        className="anim-aura pointer-events-none absolute -inset-6 rounded-full"
        style={{ background: `radial-gradient(circle, ${spec.inner} 0%, ${spec.outer} 70%)` }}
      />
      {spec.particles?.positions.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute select-none text-xs"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `twinkle 2.6s ease-in-out ${p.delay}s infinite`,
            color: spec.inner,
          }}
        >
          {spec.particles!.emoji}
        </span>
      ))}
      <div className="relative">{children}</div>
    </div>
  )
}
