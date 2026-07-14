import { useEffect, useState } from 'react'
import { getRecoloredImage } from '@/lib/avatar/recolor'
import { LPC_DOWN_FRAME_POSITION } from '@/lib/avatar/providers/lpcProvider'
import type { ResolvedLayer } from '@/lib/avatar/types'

interface AvatarLayerImageProps {
  layer: ResolvedLayer
}

export function AvatarLayerImage({ layer }: AvatarLayerImageProps) {
  const [src, setSrc] = useState(layer.imageUrl)

  useEffect(() => {
    let cancelled = false

    if (layer.recolorTargetHex) {
      getRecoloredImage(layer.imageUrl, layer.recolorTargetHex).then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl)
      })
    } else {
      setSrc(layer.imageUrl)
    }

    return () => {
      cancelled = true
    }
  }, [layer.imageUrl, layer.recolorTargetHex])

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${src})`,
        backgroundPosition: LPC_DOWN_FRAME_POSITION,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        zIndex: layer.zIndex,
      }}
    />
  )
}
