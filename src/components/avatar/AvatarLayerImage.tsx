import { useEffect, useState } from 'react'
import { getRecoloredImage } from '@/lib/avatar/recolor'
import { LPC_DOWN_FRAME_POSITION, LPC_IDLE_FRAME_2_X } from '@/lib/avatar/providers/lpcProvider'
import type { ResolvedLayer } from '@/lib/avatar/types'

interface AvatarLayerImageProps {
  layer: ResolvedLayer
  /** Idle animation frame: 0 = rest, 1 = the breathing/blink frame of 2-column idle sheets. */
  frame?: 0 | 1
}

// Legacy sheets (e.g. the skeleton walk sheet) are wider than the 2-column idle
// format; animating those would look like marching in place, so each layer
// checks its sheet width once and only sways when it's a true idle sheet.
const widthCache = new Map<string, Promise<number>>()
function getSheetWidth(url: string): Promise<number> {
  let pending = widthCache.get(url)
  if (!pending) {
    pending = new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.width)
      img.onerror = () => resolve(0)
      img.src = url
    })
    widthCache.set(url, pending)
  }
  return pending
}

export function AvatarLayerImage({ layer, frame = 0 }: AvatarLayerImageProps) {
  const [src, setSrc] = useState(layer.imageUrl)
  const [isIdleSheet, setIsIdleSheet] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (layer.recolorTargetHex) {
      getRecoloredImage(layer.imageUrl, layer.recolorTargetHex).then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl)
      })
    } else {
      setSrc(layer.imageUrl)
    }

    if (!layer.singleFrame) {
      getSheetWidth(layer.imageUrl).then((w) => {
        if (!cancelled) setIsIdleSheet(w === 128)
      })
    }

    return () => {
      cancelled = true
    }
  }, [layer.imageUrl, layer.recolorTargetHex, layer.singleFrame])

  const frameX = frame === 1 && isIdleSheet && !layer.singleFrame ? LPC_IDLE_FRAME_2_X : 0

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: layer.singleFrame ? '0px 0px' : `${frameX}px ${LPC_DOWN_FRAME_POSITION.split(' ')[1]}`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        zIndex: layer.zIndex,
        // Centered on the head rather than the whole frame, so resizing a
        // helmet doesn't shift it off the character.
        transform: layer.scale && layer.scale !== 1 ? `scale(${layer.scale})` : undefined,
        transformOrigin: '50% 32%',
      }}
    />
  )
}
