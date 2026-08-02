import { useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { biomeById, resolveBiomeVariant } from '@/data/biomes'
import { BiomeScene } from './scenes/BiomeScene'
import type { BiomeId } from '@/types'
import type { BiomeSticker, BiomeVariant } from '@/store/useAvatarStore'

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

/**
 * Renders a biome as a live SVG scene — no background art to load, and each
 * world has a genuinely different day and night personality with something
 * always in motion (drifting clouds, rising embers, flickering torches, traffic).
 */
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
  const biome = biomeId ? biomeById(biomeId) : undefined
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
      style={{ backgroundColor: biome?.color ?? 'var(--color-ink-800)' }}
    >
      {biomeId && <BiomeScene biomeId={biomeId} daylight={resolved === 'light'} seedKey={seedKey} />}

      {vignette && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950/90" />
      )}

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
          className={cn(
            'absolute -translate-x-1/2 -translate-y-1/2 text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]',
            onStickerTap && 'hover:scale-125',
          )}
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
