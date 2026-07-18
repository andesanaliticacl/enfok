import { AvatarLayerImage } from './AvatarLayerImage'
import type { ResolvedLayer } from '@/lib/avatar/types'

interface LayerThumbProps {
  /** Already-resolved layers to compose, e.g. body+head as context plus the candidate garment. */
  layers: ResolvedLayer[]
  /** Frame-space Y (0-64) to center the crop on — 14 ≈ hair, 32 ≈ torso, 56 ≈ feet. */
  focusY?: number
  zoom?: number
  size?: number
  className?: string
}

/**
 * A cropped, zoomed preview of one avatar option rendered from the real
 * sprite layers — the creation grids show what you'd actually get, not a
 * label with arrows.
 */
export function LayerThumb({ layers, focusY = 32, zoom = 1.6, size = 56, className }: LayerThumbProps) {
  const sorted = [...layers].sort((a, b) => a.zIndex - b.zIndex)
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 64,
          height: 64,
          transform: `translate(-32px, -${focusY}px) scale(${zoom})`,
          transformOrigin: `32px ${focusY}px`,
        }}
      >
        {sorted.map((layer) => (
          <AvatarLayerImage key={`${layer.category}-${layer.imageUrl}`} layer={layer} />
        ))}
      </div>
    </div>
  )
}
