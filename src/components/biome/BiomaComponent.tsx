import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { biomes, biomeBackgroundUrl, resolveBiomeVariant } from '@/data/biomes'
import type { BiomeId } from '@/types'
import type { BiomeSticker, BiomeVariant } from '@/store/useAvatarStore'

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

/**
 * Every biome breathes light: a soft ambient glow whose color and place
 * belong to the scene — sun or moon over the valley, urban haze over the
 * skyline, moonlit forest, a summit halo, an aurora in space.
 */
function AuraLayer({ biomeId, daylight }: { biomeId: BiomeId; daylight: boolean }) {
  const auras: Record<BiomeId, { className: string; style: CSSProperties }[]> = {
    valle: [
      daylight
        ? { className: 'left-[10%] top-[6%] h-16 w-16', style: { backgroundColor: 'rgba(255, 214, 120, 0.45)' } }
        : { className: 'right-[12%] top-[8%] h-12 w-12', style: { backgroundColor: 'rgba(190, 215, 255, 0.4)' } },
    ],
    playa: [
      daylight
        ? { className: 'right-[14%] top-[5%] h-16 w-16', style: { backgroundColor: 'rgba(255, 220, 130, 0.5)' } }
        : { className: 'right-[16%] top-[7%] h-11 w-11', style: { backgroundColor: 'rgba(210, 225, 255, 0.45)' } },
    ],
    bosque: [
      daylight
        ? { className: 'left-[30%] top-[0%] h-14 w-28', style: { backgroundColor: 'rgba(190, 235, 150, 0.28)' } }
        : { className: 'left-[35%] top-[2%] h-12 w-24', style: { backgroundColor: 'rgba(150, 170, 255, 0.25)' } },
    ],
    montana: [
      { className: 'left-[38%] top-[10%] h-10 w-24', style: { backgroundColor: daylight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(180, 205, 255, 0.3)' } },
    ],
    ciudad: [
      daylight
        ? { className: 'left-[20%] top-[4%] h-12 w-32', style: { backgroundColor: 'rgba(255, 235, 190, 0.25)' } }
        : { className: 'inset-x-[15%] top-[52%] h-10', style: { backgroundColor: 'rgba(120, 200, 255, 0.18)' } },
    ],
    espacio: [
      { className: 'inset-x-[10%] top-[36%] h-8', style: { backgroundColor: 'rgba(140, 255, 200, 0.16)' } },
    ],
  }

  return (
    <>
      {(auras[biomeId] ?? []).map((aura, i) => (
        <div key={i} className={cn('anim-aura absolute rounded-full blur-xl', aura.className)} style={aura.style} />
      ))}
    </>
  )
}

function ForestOverlay({ seedKey, daylight }: OverlayProps) {
  // The forest's signature is no longer the campfire (auras are everywhere
  // now) — it's the glowing mushrooms on the forest floor.
  const mushrooms = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-shrooms`))
    return Array.from({ length: 4 }, () => ({
      left: 8 + rand() * 80,
      top: 74 + rand() * 18,
      delay: rand() * 3,
      duration: 2.6 + rand() * 2,
      violet: rand() > 0.5,
    }))
  }, [seedKey])

  const leaves = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-leaves`))
    return Array.from({ length: 6 }, () => ({
      left: 5 + rand() * 90,
      top: 5 + rand() * 25,
      delay: rand() * 6,
      duration: 5 + rand() * 3,
      drift: 8 + rand() * 14,
    }))
  }, [seedKey])

  const flies = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-flies`))
    return Array.from({ length: 4 }, () => ({
      left: 15 + rand() * 70,
      top: 55 + rand() * 30,
      delay: rand() * 4,
      duration: 3.5 + rand() * 2,
    }))
  }, [seedKey])

  return (
    <>
      {mushrooms.map((m, i) => (
        <span key={`shroom-${i}`} className="absolute" style={{ left: `${m.left}%`, top: `${m.top}%` }}>
          <span
            className="anim-twinkle absolute -inset-1.5 rounded-full blur-[3px]"
            style={{
              backgroundColor: m.violet ? 'rgba(180, 130, 255, 0.5)' : 'rgba(110, 231, 255, 0.5)',
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`,
            }}
          />
          <span
            className="relative block h-[3px] w-[3px] rounded-full"
            style={{ backgroundColor: m.violet ? 'rgb(205, 170, 255)' : 'rgb(160, 240, 255)' }}
          />
        </span>
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
      {!daylight &&
        flies.map((f, i) => (
          <span
            key={`fly-${i}`}
            className="anim-firefly absolute h-1 w-1 rounded-full bg-lime-200/90 blur-[0.5px]"
            style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s` }}
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

  const sparkles = useMemo(() => {
    const rand = mulberry32(seedFrom(`${seedKey}-sparkles`))
    return Array.from({ length: 7 }, () => ({
      left: 8 + rand() * 84,
      top: 63 + rand() * 9,
      delay: rand() * 3,
      duration: 1.8 + rand() * 1.6,
    }))
  }, [seedKey])

  return (
    <>
      <div className="anim-fog absolute inset-x-[-15%] top-[56%] h-6 bg-white/15 blur-md" style={{ animationDuration: '16s' }} />
      {/* Sun or moon glitter dancing on the water band */}
      {sparkles.map((s, i) => (
        <span
          key={`sparkle-${i}`}
          className={cn('anim-twinkle absolute h-[2px] w-[3px] rounded-full', daylight ? 'bg-yellow-100/90' : 'bg-blue-100/80')}
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s` }}
        />
      ))}
      <div className="anim-wave absolute inset-x-0 top-[70%] h-1.5 bg-white/45 blur-[1.5px]" />
      <div className="anim-wave absolute inset-x-0 top-[74%] h-1 bg-white/30 blur-[1.5px]" style={{ animationDelay: '0.9s' }} />
      <div className="anim-wave absolute inset-x-0 top-[77%] h-[3px] bg-white/20 blur-[2px]" style={{ animationDelay: '1.8s', animationDuration: '4.5s' }} />
      {/* A crab patrols the sand, turning around at the edges */}
      <span className="anim-crab absolute bottom-[7%] left-0 right-0 text-[9px]" style={{ animationDelay: '2s' }}>
        <span className="inline-block">🦀</span>
      </span>
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
  /** Player-placed decorations, positioned as % of the scene. */
  stickers?: BiomeSticker[]
  /** When set, tapping a sticker calls this (used by the decorate mode to remove them). */
  onStickerTap?: (stickerId: string) => void
  /** When set, tapping empty scenery reports the % position (used by the decorate mode to place stickers). */
  onSceneTap?: (x: number, y: number) => void
  vignette?: boolean
  className?: string
  children?: ReactNode
}

/** Renders a biome's background art plus its ambient aura and "living" animation (mushrooms, waves, snow, neon, fauna, stars), following real time of day when the variant is 'auto'. */
export function BiomaComponent({
  biomeId,
  variant,
  stickers,
  onStickerTap,
  onSceneTap,
  vignette = true,
  className,
  children,
}: BiomaComponentProps) {
  const biome = biomes.find((b) => b.id === biomeId)
  const resolved = useResolvedVariant(variant)
  const seedKey = `${biomeId ?? 'none'}-${resolved}`

  function handleSceneClick(e: MouseEvent<HTMLDivElement>) {
    if (!onSceneTap) return
    // Buttons inside the scene (variant toggles, stickers) handle their own clicks.
    if ((e.target as HTMLElement).closest('button')) return
    const rect = e.currentTarget.getBoundingClientRect()
    onSceneTap(((e.clientX - rect.left) / rect.width) * 100, ((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <div
      className={cn('relative overflow-hidden', className, onSceneTap && 'cursor-crosshair')}
      onClick={handleSceneClick}
      style={{
        backgroundImage: biomeId ? `url(${biomeBackgroundUrl(biomeId, resolved)})` : undefined,
        backgroundColor: biome?.color ?? 'var(--color-ink-800)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
      }}
    >
      {biomeId && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <AuraLayer biomeId={biomeId} daylight={resolved === 'light'} />
          <LivingLayer biomeId={biomeId} seedKey={seedKey} daylight={resolved === 'light'} />
        </div>
      )}

      {vignette && <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950/90" />}

      {stickers?.map((sticker) => (
        <motion.button
          key={sticker.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          disabled={!onStickerTap}
          onClick={(e) => {
            e.stopPropagation()
            onStickerTap?.(sticker.id)
          }}
          className={cn('absolute -translate-x-1/2 -translate-y-1/2 text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]', onStickerTap && 'hover:scale-125')}
          style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
          title={onStickerTap ? 'Tocar para quitar' : undefined}
        >
          {sticker.emoji}
        </motion.button>
      ))}

      {children}
    </div>
  )
}
