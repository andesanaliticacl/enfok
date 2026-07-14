import { getRecoloredImage } from '@/lib/avatar/recolor'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import type { AvatarConfig, AvatarLayerCategory } from '@/lib/avatar/types'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Resolves the image currently shown for a layer (pixel override, recolored
 * asset, or baked asset) and crops it down to a single frameSize x frameSize
 * canvas of just the down-facing pose — the starting point for the painter.
 */
export async function getEditableFrame(config: AvatarConfig, category: AvatarLayerCategory): Promise<HTMLCanvasElement> {
  const frameSize = lpcProvider.frameSize
  const canvas = document.createElement('canvas')
  canvas.width = frameSize
  canvas.height = frameSize
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  const override = config.pixelOverrides?.[category]
  if (override) {
    const img = await loadImage(override)
    ctx.drawImage(img, 0, 0, frameSize, frameSize)
    return canvas
  }

  const optionId = config.options[category]
  if (!optionId) return canvas

  const layer = lpcProvider.resolveLayer(category, optionId, config.colors[category], config.figure)
  if (!layer) return canvas

  const src = layer.recolorTargetHex ? await getRecoloredImage(layer.imageUrl, layer.recolorTargetHex) : layer.imageUrl
  const img = await loadImage(src)

  if (layer.singleFrame) {
    ctx.drawImage(img, 0, 0, frameSize, frameSize)
  } else {
    // Down-facing row is the 3rd of 4 rows in the universal LPC layout.
    ctx.drawImage(img, 0, frameSize * 2, frameSize, frameSize, 0, 0, frameSize, frameSize)
  }

  return canvas
}
