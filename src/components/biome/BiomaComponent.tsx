import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { biomes, biomeBackgroundUrl, resolveBiomeVariant } from '@/data/biomes'
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

interface OverlayProps {
  seedKey: string
  /** Resolved time of day — overlays choose their fauna/particles with it. */
  daylight: boolean
}

function ForestOverlay({ seedKey, daylight }: OverlayProps) {
  const sparks = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-sparks`))
    return Array.from({ length: daylight ? 5 : 8 }, () => ({
      left: 45 + rand() * 10,
      delay: rand() * 1.6,
      duration: 1.1 + rand() * 0.9,
      drift: (rand() - 0.5) * 16,
    }))
  }, [seedKey, daylight])

  const leaves = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-leaves`))
    return Array.from({ length: 5 }, () => ({
      left: 5 + rand() * 90,
      top: 5 + rand() * 25,
      delay: rand() * 6,
      duration: 5 + rand() * 3,
      drift: 8 + rand() * 14,
    }))
  }, [seedKey])

  return (
    <>
      {/* The campfire burns day and night, but it owns the scene after dark */}
      <div
        className={cn(
          'anim-glow-pulse absolute bottom-[15%] left-1/2 h-8 w-14 -translate-x-1/2 rounded-full blur-md',
          daylight ? 'bg-orange-500/35' : 'bg-orange-500/60',
        )}
      />
      {sparks.map((s, i) => (
        <span
          key={i}
          className="anim-spark absolute bottom-[17%] block h-1 w-1 rounded-full bg-orange-300"
          style={{ left: `${s.left}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`, '--drift': `${s.drift}px` } as CSSProperties}
        />
      ))}
      {leaves.map((l, i) => (
        <span
          key={`leaf-${i}`}
          className="anim-leaf absolute block h-1.5 w-1 rounded-[1px]"
          style={{
            left: `${l.left}%`,
            top: `${l.top}%`,
            backgroundColor: daylight ? 'rgba(122, 154, 74, 0.85)' : 'rgba(74, 100, 52, 0.7)',
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`,
            '--drift': `${l.drift}px`,
          } as CSSProperties}
        />
      ))}
      <div className="anim-fog absolute inset-x-[-20%] bottom-0 h-8 bg-gradient-to-t from-white/10 to-transparent blur-sm" />
    </>
  )
}

function BeachOverlay({ seedKey, daylight }: OverlayProps) {
  // This biome's generated art has its horizon/sea band around 62-73% down
  // and the shoreline (sea meets sand) around 73-76% — waves and mist are
  // anchored there, not at the bottom of the frame (which is dry sand).
  const gulls = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-gulls`))
    return Array.from({ length: 3 }, () => ({
      top: 12 + rand() * 22,
      duration: 13 + rand() * 7,
      delay: rand() * 9,
      scale: 0.7 + rand() * 0.5,
    }))
  }, [seedKey])

  return (
    <>
      <div className="anim-fog absolute inset-x-[-15%] top-[56%] h-6 bg-white/15 blur-md" style={{ animationDuration: '16s' }} />
      <div className="anim-wave absolute inset-x-0 top-[70%] h-1.5 bg-white/45 blur-[1.5px]" />
      <div className="anim-wave absolute inset-x-0 top-[74%] h-1 bg-white/30 blur-[1.5px]" style={{ animationDelay: '0.9s' }} />
      {daylight
        ? gulls.map((g, i) => (
            <span
              key={i}
              className="anim-bird absolute text-white/70"
              style={{ top: `${g.top}%`, animationDuration: `${g.duration}s`, animationDelay: `${g.delay}s`, fontSize: `${8 * g.scale}px` }}
            >
              ⌄⌄
            </span>
          ))
        : /* Moonlight lane across the water */
          <div className="anim-wave absolute left-[38%] right-[38%] top-[64%] h-[9%] bg-gradient-to-b from-white/25 to-transparent blur-[2px]" style={{ animationDuration: '5s' }} />}
    </>
  )
}

function MountainOverlay({ seedKey, daylight }: OverlayProps) {
  const birds = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-birds`))
    return Array.from({ length: 4 }, () => ({
      top: 10 + rand() * 20,
      duration: 11 + rand() * 8,
      delay: rand() * 10,
      scale: 0.7 + rand() * 0.6,
    }))
  }, [seedKey])

  const snow = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-snow`))
    return Array.from({ length: 8 }, () => ({
      left: rand() * 96,
      top: rand() * 30,
      delay: rand() * 7,
      duration: 6 + rand() * 3,
      drift: (rand() - 0.5) * 20,
    }))
  }, [seedKey])

  return (
    <>
      {snow.map((s, i) => (
        <span
          key={`snow-${i}`}
          className="anim-snow absolute block h-1 w-1 rounded-full bg-white/80"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`, '--drift': `${s.drift}px` } as CSSProperties}
        />
      ))}
      {daylight
        ? birds.map((b, i) => (
            <span
              key={i}
              className="anim-bird absolute text-ink-900/60"
              style={{ top: `${b.top}%`, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s`, fontSize: `${8 * b.scale}px` }}
            >
              ⌃⌃
            </span>
          ))
        : Array.from({ length: 5 }, (_, i) => (
            <span
              key={`star-${i}`}
              className="anim-twinkle absolute h-[2px] w-[2px] rounded-full bg-white/90"
              style={{ left: `${12 + i * 18}%`, top: `${6 + (i % 3) * 5}%`, animationDelay: `${i * 0.7}s` }}
            />
          ))}
    </>
  )
}

function CityOverlay({ seedKey, daylight }: OverlayProps) {
  // The skyline silhouette starts around 63% down this biome's art — lights
  // need to sit on the buildings, not float in the sky above them.
  const lights = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-lights`))
    return Array.from({ length: daylight ? 0 : 7 }, () => ({
      left: 6 + rand() * 88,
      top: 68 + rand() * 26,
      delay: rand() * 4,
      color: rand() > 0.5 ? 'bg-cyan-300/80' : 'bg-pink-400/80',
    }))
  }, [seedKey, daylight])

  const windows = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-windows`))
    return Array.from({ length: daylight ? 4 : 10 }, () => ({
      left: 8 + rand() * 84,
      top: 66 + rand() * 28,
      delay: rand() * 6,
    }))
  }, [seedKey, daylight])

  return (
    <>
      {lights.map((l, i) => (
        <span
          key={i}
          className={cn('anim-neon absolute h-1 w-1 rounded-full blur-[1px]', l.color)}
          style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }}
        />
      ))}
      {/* Lit windows: a city that someone actually lives in */}
      {windows.map((w, i) => (
        <span
          key={`win-${i}`}
          className={cn('anim-window absolute h-[3px] w-[2px]', daylight ? 'bg-white/40' : 'bg-amber-200/90')}
          style={{ left: `${w.left}%`, top: `${w.top}%`, animationDelay: `${w.delay}s` }}
        />
      ))}
      <div className="anim-shine absolute inset-x-0 top-[90%] h-2 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-[1px]" />
    </>
  )
}

function ValleyOverlay({ seedKey, daylight }: OverlayProps) {
  // The grass field starts around 63% down this biome's art — fauna hovers
  // over it, not in the sky.
  const particles = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-fauna`))
    return Array.from({ length: 6 }, () => ({
      left: 10 + rand() * 80,
      top: 66 + rand() * 28,
      delay: rand() * 4,
      duration: 3 + rand() * 2,
    }))
  }, [seedKey])

  if (daylight) {
    return (
      <>
        {particles.slice(0, 3).map((p, i) => (
          <span
            key={`bf-${i}`}
            className="anim-butterfly absolute block h-1.5 w-1.5 rounded-[1px]"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: i % 2 === 0 ? 'rgba(240, 200, 90, 0.95)' : 'rgba(220, 140, 190, 0.9)',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration + 2}s`,
            }}
          />
        ))}
        {particles.slice(3).map((p, i) => (
          <span
            key={`pollen-${i}`}
            className="anim-firefly absolute h-[3px] w-[3px] rounded-full bg-yellow-100/70 blur-[0.5px]"
            style={{ left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration + 3}s` }}
          />
        ))}
      </>
    )
  }

  return (
    <>
      {particles.map((f, i) => (
        <span
          key={i}
          className="anim-firefly absolute h-1 w-1 rounded-full bg-lime-200/90 blur-[0.5px]"
          style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s` }}
        />
      ))}
    </>
  )
}

function SpaceOverlay({ seedKey }: OverlayProps) {
  const stars = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-stars`))
    return Array.from({ length: 14 }, () => ({
      left: rand() * 100,
      top: rand() * 92,
      delay: rand() * 3,
      duration: 1.6 + rand() * 2,
    }))
  }, [seedKey])

  return (
    <>
      {/* Distant nebulae breathing */}
      <div className="anim-nebula absolute left-[12%] top-[18%] h-16 w-24 rounded-full bg-purple-500/20 blur-xl" />
      <div className="anim-nebula absolute right-[8%] top-[55%] h-12 w-20 rounded-full bg-cyan-400/15 blur-xl" style={{ animationDelay: '4s' }} />
      {stars.map((s, i) => (
        <span
          key={i}
          className="anim-twinkle absolute h-[3px] w-[3px] rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}
      <span className="anim-shooting-star absolute left-[8%] top-[12%] h-px w-10 rotate-45 bg-gradient-to-r from-white to-transparent" />
      <span className="anim-shooting-star absolute left-[55%] top-[30%] h-px w-8 rotate-45 bg-gradient-to-r from-white to-transparent" style={{ animationDelay: '3.4s', animationDuration: '9s' }} />
    </>
  )
}

function LivingLayer({ biomeId, seedKey, daylight }: { biomeId: BiomeId } & OverlayProps) {
  switch (biomeId) {
    case 'bosque':
      return <ForestOverlay seedKey={seedKey} daylight={daylight} />
    case 'playa':
      return <BeachOverlay seedKey={seedKey} daylight={daylight} />
    case 'montana':
      return <MountainOverlay seedKey={seedKey} daylight={daylight} />
    case 'ciudad':
      return <CityOverlay seedKey={seedKey} daylight={daylight} />
    case 'valle':
      return <ValleyOverlay seedKey={seedKey} daylight={daylight} />
    case 'espacio':
      return <SpaceOverlay seedKey={seedKey} daylight={daylight} />
    default:
      return null
  }
}

/** Re-resolves the 'auto' variant every few minutes so the scene crosses dusk/dawn while the app is open. */
function useResolvedVariant(variant: BiomeVariant): 'light' | 'dark' {
  const [resolved, setResolved] = useState(() => resolveBiomeVariant(variant))

  useEffect(() => {
    setResolved(resolveBiomeVariant(variant))
    if (variant !== 'auto') return
    const timer = setInterval(() => setResolved(resolveBiomeVariant('auto')), 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [variant])

  return resolved
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

/** Renders a biome's background art plus its ambient "living" animation (fire, waves, snow, neon, fauna, stars), following real time of day when the variant is 'auto'. */
export function BiomaComponent({ biomeId, variant, customArt, vignette = true, className, children }: BiomaComponentProps) {
  const biome = biomes.find((b) => b.id === biomeId)
  const resolved = useResolvedVariant(variant)
  const seedKey = `${biomeId ?? 'none'}-${resolved}`

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        backgroundImage: `url(${customArt || (biomeId ? biomeBackgroundUrl(biomeId, resolved) : '')})`,
        backgroundColor: biome?.color ?? 'var(--color-ink-800)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
      }}
    >
      {biomeId && !customArt && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <LivingLayer biomeId={biomeId} seedKey={seedKey} daylight={resolved === 'light'} />
        </div>
      )}
      {vignette && <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950/90" />}
      {children}
    </div>
  )
}
