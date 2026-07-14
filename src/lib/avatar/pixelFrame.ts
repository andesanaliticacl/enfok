import { getRecoloredImage } from '@/lib/avatar/recolor'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import type { AvatarConfig, AvatarLayerCategory } from '@/lib/avatar/types'

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function newFrameCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const frameSize = lpcProvider.frameSize
  const canvas = document.createElement('canvas')
  canvas.width = frameSize
  canvas.height = frameSize
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  return { canvas, ctx }
}

/**
 * Resolves the image currently shown for a layer (pixel override, recolored
 * asset, or baked asset) and crops it down to a single frameSize x frameSize
 * canvas of just the down-facing pose — the starting point for the painter.
 */
export async function getEditableFrame(config: AvatarConfig, category: AvatarLayerCategory): Promise<HTMLCanvasElement> {
  const frameSize = lpcProvider.frameSize
  const { canvas, ctx } = newFrameCanvas()

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

/**
 * The set of pixels that actually belong to the equipped garment/accessory
 * shape, derived from the BASE asset (never the user's paint) so it stays
 * constant no matter what's already been painted. Used to stop the brush
 * from painting outside the silhouette (e.g. off the edge of a mask).
 */
export async function getLayerSilhouette(config: AvatarConfig, category: AvatarLayerCategory): Promise<boolean[][] | null> {
  const optionId = config.options[category]
  if (!optionId) return null

  const layer = lpcProvider.resolveLayer(category, optionId, config.colors[category], config.figure)
  if (!layer) return null

  const frameSize = lpcProvider.frameSize
  const { ctx } = newFrameCanvas()
  // Recoloring never touches alpha, so the raw (un-recolored) asset has the same shape.
  const img = await loadImage(layer.imageUrl)

  if (layer.singleFrame) {
    ctx.drawImage(img, 0, 0, frameSize, frameSize)
  } else {
    ctx.drawImage(img, 0, frameSize * 2, frameSize, frameSize, 0, 0, frameSize, frameSize)
  }

  const { data } = ctx.getImageData(0, 0, frameSize, frameSize)
  const grid: boolean[][] = []
  for (let y = 0; y < frameSize; y++) {
    const row: boolean[] = []
    for (let x = 0; x < frameSize; x++) {
      row.push(data[(y * frameSize + x) * 4 + 3] > 10)
    }
    grid.push(row)
  }
  return grid
}

/** Biome background art: whatever the user already painted, or a flat fill of the biome's color. */
export async function getEditableBiomeFrame(biomeArt: string | null, biomeColor: string): Promise<HTMLCanvasElement> {
  const frameSize = lpcProvider.frameSize
  const { canvas, ctx } = newFrameCanvas()

  if (biomeArt) {
    const img = await loadImage(biomeArt)
    ctx.drawImage(img, 0, 0, frameSize, frameSize)
  } else {
    ctx.fillStyle = biomeColor
    ctx.fillRect(0, 0, frameSize, frameSize)
  }

  return canvas
}
