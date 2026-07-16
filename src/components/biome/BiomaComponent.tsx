import { useMemo, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { biomes, biomeBackgroundUrl } from '@/data/biomes'
import type { BiomeId } from '@/types'
import type { BiomeVariant } from '@/store/useAvatarStore'

/** Deterministic PRNG so particle layout is stable across re-renders but differs per biome/variant. */
function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFrom(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return h
}

function ForestOverlay({ seedKey }: { seedKey: string }) {
  const sparks = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-sparks`))
    return Array.from({ length: 7 }, () => ({
      left: 45 + rand() * 10,
      delay: rand() * 1.6,
      duration: 1.1 + rand() * 0.9,
      drift: (rand() - 0.5) * 16,
    }))
  }, [seedKey])

  return (
    <>
      <div className="anim-glow-pulse absolute bottom-[15%] left-1/2 h-8 w-14 -translate-x-1/2 rounded-full bg-orange-500/50 blur-md" />
      {sparks.map((s, i) => (
        <span
          key={i}
          className="anim-spark absolute bottom-[17%] block h-1 w-1 rounded-full bg-orange-300"
          style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`, '--drift': `${s.drift}px` } as CSSProperties}
        />
      ))}
      <div className="anim-fog absolute inset-x-[-20%] bottom-0 h-8 bg-gradient-to-t from-white/10 to-transparent blur-sm" />
    </>
  )
}

function BeachOverlay() {
  // This biome's generated art has its horizon/sea band around 62-73% down
  // and the shoreline (sea meets sand) around 73-76% — waves and mist are
  // anchored there, not at the bottom of the frame (which is dry sand).
  return (
    <>
      <div className="anim-fog absolute inset-x-[-15%] top-[56%] h-6 bg-white/15 blur-md" style={{ animationDuration: '16s' }} />
      <div className="anim-wave absolute inset-x-0 top-[70%] h-1.5 bg-white/45 blur-[1.5px]" />
      <div className="anim-wave absolute inset-x-0 top-[74%] h-1 bg-white/30 blur-[1.5px]" style={{ animationDelay: '0.9s' }} />
    </>
  )
}

function MountainOverlay({ seedKey }: { seedKey: string }) {
  const birds = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-birds`))
    return Array.from({ length: 4 }, () => ({
      top: 10 + rand() * 20,
      duration: 11 + rand() * 8,
      delay: rand() * 10,
      scale: 0.7 + rand() * 0.6,
    }))
  }, [seedKey])

  return (
    <>
      {birds.map((b, i) => (
        <span
          key={i}
          className="anim-bird absolute text-ink-900/60"
          style={{ top: `${b.top}%`, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s`, fontSize: `${8 * b.scale}px` }}
        >
          ⌃⌃
        </span>
      ))}
    </>
  )
}

function CityOverlay({ seedKey }: { seedKey: string }) {
  // The skyline silhouette starts around 63% down this biome's art — lights
  // need to sit on the buildings, not float in the sky above them.
  const lights = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-lights`))
    return Array.from({ length: 7 }, () => ({
      left: 6 + rand() * 88,
      top: 68 + rand() * 26,
      delay: rand() * 4,
      color: rand() > 0.5 ? 'bg-cyan-300/80' : 'bg-pink-400/80',
    }))
  }, [seedKey])

  return (
    <>
      {lights.map((l, i) => (
        <span
          key={i}
          className={cn('anim-neon absolute h-1 w-1 rounded-full blur-[1px]', l.color)}
          style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }}
        />
      ))}
      <div className="anim-shine absolute inset-x-0 top-[90%] h-2 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-[1px]" />
    </>
  )
}

function ValleyOverlay({ seedKey }: { seedKey: string }) {
  // The grass field starts around 63% down this biome's art — fireflies hover
  // over it, not in the sky.
  const flies = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-flies`))
    return Array.from({ length: 6 }, () => ({
      left: 10 + rand() * 80,
      top: 66 + rand() * 28,
      delay: rand() * 4,
      duration: 3 + rand() * 2,
    }))
  }, [seedKey])

  return (
    <>
      {flies.map((f, i) => (
        <span
          key={i}
          className="anim-firefly absolute h-1 w-1 rounded-full bg-lime-200/90 blur-[0.5px]"
          style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s` }}
        />
      ))}
    </>
  )
}

function SpaceOverlay({ seedKey }: { seedKey: string }) {
  const stars = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-stars`))
    return Array.from({ length: 12 }, () => ({
      left: rand() * 100,
      top: rand() * 92,
      delay: rand() * 3,
      duration: 1.6 + rand() * 2,
    }))
  }, [seedKey])

  return (
    <>
      {stars.map((s, i) => (
        <span
          key={i}
          className="anim-twinkle absolute h-[3px] w-[3px] rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}
      <span className="anim-shooting-star absolute left-[8%] top-[12%] h-px w-10 rotate-45 bg-gradient-to-r from-white to-transparent" />
    </>
  )
}

function LivingLayer({ biomeId, seedKey }: { biomeId: BiomeId; seedKey: string }) {
  switch (biomeId) {
    case 'bosque':
      return <ForestOverlay seedKey={seedKey} />
    case 'playa':
      return <BeachOverlay />
    case 'montana':
      return <MountainOverlay seedKey={seedKey} />
    case 'ciudad':
      return <CityOverlay seedKey={seedKey} />
    case 'valle':
      return <ValleyOverlay seedKey={seedKey} />
    case 'espacio':
      return <SpaceOverlay seedKey={seedKey} />
    default:
      return null
  }
}

interface BiomaComponentProps {
  biomeId: BiomeId | null | undefined
  variant: BiomeVariant
  /** A user-painted override replaces the generated art — the living layer is skipped since its particle positions are tuned to the generated scenery. */
  customArt?: string | null
  vignette?: boolean
  className?: string
  children?: ReactNode
}

/** Renders a biome's background art plus its ambient "living" animation (fire, waves, birds, neon, fireflies, stars). */
export function BiomaComponent({ biomeId, variant, customArt, vignette = true, className, children }: BiomaComponentProps) {
  const biome = biomes.find((b) => b.id === biomeId)
  const seedKey = `${biomeId ?? 'none'}-${variant}`

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        backgroundImage: `url(${customArt || (biomeId ? biomeBackgroundUrl(biomeId, variant) : '')})`,
        backgroundColor: biome?.color ?? 'var(--color-ink-800)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
      }}
    >
      {biomeId && !customArt && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <LivingLayer biomeId={biomeId} seedKey={seedKey} />
        </div>
      )}
      {vignette && <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950/90" />}
      {children}
    </div>
  )
}
