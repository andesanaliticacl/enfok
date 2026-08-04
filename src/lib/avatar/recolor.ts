/**
 * Generic sprite recolor engine: shifts every opaque pixel's hue/saturation
 * toward a target color while preserving its original lightness, so shading
 * and highlights painted into the pixel art survive the recolor. Works on
 * any single-layer transparent PNG regardless of asset provider.
 */

const cache = new Map<string, Promise<string>>()

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h, s, l }
}

function hslToRgb(h: number, s: number, l: number) {
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ]
}

async function recolorImage(src: string, targetHex: string): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const target = hexToHsl(targetHex)

  const lightnessAt = (i: number) => {
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    return (Math.max(r, g, b) + Math.min(r, g, b)) / 2
  }

  // Average lightness of the artwork, so the recolor can be re-centred on the
  // chosen swatch. Taking hue alone (the old behaviour) kept every pixel at the
  // source sprite's brightness, which is why a dark brown skin tone came out as
  // a pale tan: the hue was right but the artwork was never allowed to darken.
  let sum = 0
  let opaque = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    sum += lightnessAt(i)
    opaque++
  }
  const sourceMean = opaque > 0 ? sum / opaque : 0.5

  // Shading is the deviation from that mean, kept (slightly compressed so very
  // dark or very light targets don't clip their highlights away).
  const SHADING = 0.85

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    const outL = Math.min(1, Math.max(0, target.l + (lightnessAt(i) - sourceMean) * SHADING))
    const [nr, ng, nb] = hslToRgb(target.h, target.s, outL)
    data[i] = nr
    data[i + 1] = ng
    data[i + 2] = nb
  }

  ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0)
  return canvas.toDataURL('image/png')
}

export function getRecoloredImage(src: string, targetHex: string): Promise<string> {
  const key = `${src}::${targetHex}`
  let pending = cache.get(key)
  if (!pending) {
    pending = recolorImage(src, targetHex)
    cache.set(key, pending)
  }
  return pending
}
