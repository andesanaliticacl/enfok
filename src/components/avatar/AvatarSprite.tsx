import { useMemo } from 'react'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import { AvatarLayerImage } from './AvatarLayerImage'
import type { AvatarConfig } from '@/lib/avatar/types'

interface AvatarSpriteProps {
  config: AvatarConfig
  scale?: number
  className?: string
}

const provider = lpcProvider

export function AvatarSprite({ config, scale = 3, className }: AvatarSpriteProps) {
  const layers = useMemo(() => {
    return provider.categories
      .map((category) => {
        const optionId = config.options[category]
        if (!optionId) return null
        const colorId = config.colors[category]
        return provider.resolveLayer(category, optionId, colorId, config.figure)
      })
      .filter((layer) => layer !== null)
      .sort((a, b) => a.zIndex - b.zIndex)
  }, [config])

  const size = provider.frameSize * scale

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          width: provider.frameSize,
          height: provider.frameSize,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
        }}
      >
        {layers.map((layer) => (
          <AvatarLayerImage key={layer.category} layer={layer} />
        ))}
      </div>
    </div>
  )
}
