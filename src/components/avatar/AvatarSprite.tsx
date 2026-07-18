import { useEffect, useMemo, useState } from 'react'
import { lpcProvider, isHatResizable } from '@/lib/avatar/providers/lpcProvider'
import { AvatarLayerImage } from './AvatarLayerImage'
import type { AvatarConfig } from '@/lib/avatar/types'

interface AvatarSpriteProps {
  config: AvatarConfig
  /** Final rendered box size in pixels. The internal scale is derived from this, so the sprite never gets clipped by a mismatched container. */
  size?: number
  className?: string
  /** Plays the subtle idle animation (breathing sway + blink) using the sheets' second idle frame. */
  animate?: boolean
}

const provider = lpcProvider

/**
 * Irregular idle rhythm: rest on frame 0 for a few seconds, hold the second
 * frame briefly — reads as a blink/breath rather than a mechanical loop.
 */
function useIdleFrame(enabled: boolean): 0 | 1 {
  const [frame, setFrame] = useState<0 | 1>(0)

  useEffect(() => {
    if (!enabled) {
      setFrame(0)
      return
    }
    let alive = true
    let timer: number

    function rest() {
      timer = window.setTimeout(() => {
        if (!alive) return
        setFrame(1)
        timer = window.setTimeout(() => {
          if (!alive) return
          setFrame(0)
          rest()
        }, 320)
      }, 1600 + Math.random() * 2400)
    }
    rest()

    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [enabled])

  return frame
}

export function AvatarSprite({ config, size = 192, className, animate = false }: AvatarSpriteProps) {
  const frame = useIdleFrame(animate)

  const layers = useMemo(() => {
    return provider.categories
      .map((category) => {
        const optionId = config.options[category]
        if (!optionId) return null
        const colorId = config.colors[category]
        const resolved = provider.resolveLayer(category, optionId, colorId, config.figure)
        if (!resolved) return null

        const override = config.pixelOverrides?.[category]
        if (override) {
          return { ...resolved, imageUrl: override, recolorTargetHex: undefined, singleFrame: true }
        }
        if (category === 'hat' && isHatResizable(optionId)) {
          return { ...resolved, scale: config.hatScale }
        }
        return resolved
      })
      .filter((layer) => layer !== null)
      .sort((a, b) => a.zIndex - b.zIndex)
  }, [config])

  // Pixel art must scale by a whole number, or subpixel rounding shaves a row
  // of pixels off one edge (most visible at the top of the head). Snap to the
  // nearest integer scale and center the result inside the requested box.
  const scale = Math.max(1, Math.round(size / provider.frameSize))
  const renderedSize = provider.frameSize * scale
  const offset = (size - renderedSize) / 2

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          width: provider.frameSize,
          height: provider.frameSize,
          position: 'absolute',
          top: offset,
          left: offset,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {layers.map((layer) => (
          <AvatarLayerImage key={layer.category} layer={layer} frame={frame} />
        ))}
      </div>
    </div>
  )
}
