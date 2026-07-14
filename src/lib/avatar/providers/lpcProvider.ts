import type { AvatarAssetProvider, AvatarLayerCategory, ColorChoice, Figure, LayerOption, ResolvedLayer } from '@/lib/avatar/types'

const ASSET_ROOT = '/assets/lpc'

const GARMENT_COLORS: ColorChoice[] = [
  { id: 'black', label: 'Negro', swatch: '#1c1c1c' },
  { id: 'blue', label: 'Azul', swatch: '#2f5fa8' },
  { id: 'brown', label: 'Café', swatch: '#5a3a22' },
  { id: 'forest', label: 'Verde bosque', swatch: '#2f5a3a' },
  { id: 'gray', label: 'Gris', swatch: '#7a7a7a' },
  { id: 'maroon', label: 'Granate', swatch: '#6e2632' },
]

const HAIR_COLORS: ColorChoice[] = [
  { id: 'black', label: 'Negro', swatch: '#1a1a1a' },
  { id: 'brown', label: 'Castaño', swatch: '#4a2c17' },
  { id: 'blonde', label: 'Rubio', swatch: '#d4af6a' },
  { id: 'red', label: 'Pelirrojo', swatch: '#8b3a2a' },
  { id: 'gray', label: 'Canoso', swatch: '#9a9a9a' },
  { id: 'blue', label: 'Azul fantasía', swatch: '#3a5a8c' },
]

const EYE_COLORS: ColorChoice[] = [
  { id: 'brown', label: 'Café', swatch: '#4a2c17' },
  { id: 'blue', label: 'Azul', swatch: '#3a6ea5' },
  { id: 'green', label: 'Verde', swatch: '#3f7a4f' },
  { id: 'gray', label: 'Gris', swatch: '#8a8f99' },
  { id: 'amber', label: 'Ámbar', swatch: '#b5792f' },
  { id: 'hazel', label: 'Avellana', swatch: '#7a6a3a' },
]

const SKIN_COLORS: ColorChoice[] = [
  { id: 'porcelain', label: 'Porcelana', swatch: '#f2d6bb' },
  { id: 'light', label: 'Clara', swatch: '#e8b892' },
  { id: 'medium', label: 'Media', swatch: '#c98a5c' },
  { id: 'tan', label: 'Trigueña', swatch: '#a86c42' },
  { id: 'dark', label: 'Morena', swatch: '#7a4a2a' },
  { id: 'deep', label: 'Oscura', swatch: '#4a2f1c' },
]

const SHOE_COLORS: ColorChoice[] = [
  { id: 'black', label: 'Negro', swatch: '#1c1c1c' },
  { id: 'brown', label: 'Café', swatch: '#5a3a22' },
  { id: 'tan', label: 'Beige', swatch: '#c9a876' },
  { id: 'gray', label: 'Gris', swatch: '#7a7a7a' },
]

const MASK_COLORS: ColorChoice[] = [
  { id: 'dark', label: 'Oscura', swatch: '#2a2a2a' },
  { id: 'light', label: 'Clara', swatch: '#e8e8e8' },
]

const HAIR_STYLES = ['plain', 'bangs', 'pixie', 'long', 'bob', 'curly_short'] as const
const HAIR_LABELS: Record<(typeof HAIR_STYLES)[number], string> = {
  plain: 'Liso',
  bangs: 'Con flequillo',
  pixie: 'Pixie',
  long: 'Largo',
  bob: 'Bob',
  curly_short: 'Rizado corto',
}

type ShirtStyle = 'vest' | 'tunic' | 'tshirt' | 'longsleeve'

const SHIRT_STYLES: Record<ShirtStyle, { label: string; figures: Figure[]; colorMode: 'baked' | 'recolor' }> = {
  vest: { label: 'Chaleco', figures: ['male', 'muscular'], colorMode: 'baked' },
  tunic: { label: 'Túnica', figures: ['female'], colorMode: 'baked' },
  tshirt: { label: 'Polera', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  longsleeve: { label: 'Camisa manga larga', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
}

const FRAME_SIZE = 64
const DOWN_ROW_Y = -(FRAME_SIZE * 2)

const ALL_FIGURES: Figure[] = ['male', 'female', 'muscular']

function skinHex(colorId: string | undefined): string {
  return SKIN_COLORS.find((c) => c.id === colorId)?.swatch ?? SKIN_COLORS[1].swatch
}

function bodyLayer(figure: Figure, colorId: string | undefined): ResolvedLayer {
  return {
    category: 'body',
    zIndex: 0,
    imageUrl: `${ASSET_ROOT}/body/${figure}/idle.png`,
    recolorTargetHex: skinHex(colorId),
  }
}

function headLayer(figure: Figure, colorId: string | undefined): ResolvedLayer {
  return {
    category: 'head',
    zIndex: 2,
    imageUrl: `${ASSET_ROOT}/head/${figure === 'female' ? 'female' : 'male'}/idle.png`,
    recolorTargetHex: skinHex(colorId),
  }
}

export const lpcProvider: AvatarAssetProvider = {
  id: 'lpc-universal',
  frameSize: FRAME_SIZE,
  categories: ['body', 'head', 'eyes', 'hair', 'mask', 'shirt', 'pants', 'shoes'],
  attribution: {
    name: 'Liberated Pixel Cup — Universal LPC Spritesheet Character Generator',
    url: 'https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/',
    license: 'CC-BY-SA 3.0 / GPL 3.0',
  },

  listOptions(category, figure): LayerOption[] {
    switch (category) {
      case 'body':
        return ALL_FIGURES.map((f) => ({
          id: f,
          label: f === 'male' ? 'Cuerpo A' : f === 'female' ? 'Cuerpo B' : 'Cuerpo C (atlético)',
          figures: [f],
          colorMode: 'recolor',
          colors: SKIN_COLORS,
        }))

      case 'head':
        return [{ id: figure, label: 'Cabeza', figures: [figure], colorMode: 'recolor', colors: SKIN_COLORS }]

      case 'eyes':
        return [{ id: 'default', label: 'Ojos', figures: ALL_FIGURES, colorMode: 'recolor', colors: EYE_COLORS }]

      case 'hair':
        return HAIR_STYLES.map((style) => ({
          id: style,
          label: HAIR_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: 'recolor',
          colors: HAIR_COLORS,
        }))

      case 'mask':
        return [
          { id: 'none', label: 'Ninguna', figures: ALL_FIGURES, colorMode: 'none', colors: [] },
          { id: 'plain', label: 'Máscara', figures: ALL_FIGURES, colorMode: 'baked', colors: MASK_COLORS },
        ]

      case 'shirt':
        return (Object.entries(SHIRT_STYLES) as [ShirtStyle, (typeof SHIRT_STYLES)[ShirtStyle]][])
          .filter(([, def]) => def.figures.includes(figure))
          .map(([id, def]) => ({
            id,
            label: def.label,
            figures: def.figures,
            colorMode: def.colorMode,
            colors: GARMENT_COLORS,
          }))

      case 'pants':
        return [{ id: 'default', label: 'Pantalón', figures: ALL_FIGURES, colorMode: 'baked', colors: GARMENT_COLORS }]

      case 'shoes':
        return [{ id: 'default', label: 'Zapatos', figures: ALL_FIGURES, colorMode: 'recolor', colors: SHOE_COLORS }]

      default:
        return []
    }
  },

  resolveLayer(category, optionId, colorId, figure): ResolvedLayer | null {
    switch (category) {
      case 'body':
        return bodyLayer(figure, colorId)

      case 'head':
        return headLayer(figure, colorId)

      case 'eyes':
        return {
          category,
          zIndex: 5,
          imageUrl: `${ASSET_ROOT}/eyes/default/idle.png`,
          recolorTargetHex: EYE_COLORS.find((c) => c.id === colorId)?.swatch ?? EYE_COLORS[0].swatch,
        }

      case 'hair':
        return {
          category,
          zIndex: 30,
          imageUrl: `${ASSET_ROOT}/hair/${optionId}/idle.png`,
          recolorTargetHex: HAIR_COLORS.find((c) => c.id === colorId)?.swatch ?? HAIR_COLORS[0].swatch,
        }

      case 'mask':
        if (optionId !== 'plain') return null
        return {
          category,
          zIndex: 35,
          imageUrl: `${ASSET_ROOT}/facial/masks_plain/${colorId ?? 'dark'}.png`,
        }

      case 'shirt': {
        const style = (optionId as ShirtStyle) in SHIRT_STYLES ? (optionId as ShirtStyle) : 'tshirt'
        const color = colorId ?? 'blue'

        if (style === 'vest') {
          return { category, zIndex: 20, imageUrl: `${ASSET_ROOT}/torso/vest_male/${color}.png` }
        }
        if (style === 'tunic') {
          return { category, zIndex: 20, imageUrl: `${ASSET_ROOT}/torso/tunic_female/${color}.png` }
        }

        const folder = `${style}_${figure === 'female' ? 'female' : 'male'}`
        return {
          category,
          zIndex: 20,
          imageUrl: `${ASSET_ROOT}/torso/${folder}/idle.png`,
          recolorTargetHex: GARMENT_COLORS.find((c) => c.id === color)?.swatch ?? GARMENT_COLORS[0].swatch,
        }
      }

      case 'pants': {
        const color = colorId ?? 'blue'
        const folder = figure === 'female' ? 'pants_female' : figure === 'muscular' ? 'pants_muscular' : 'pants_male'
        return { category, zIndex: 10, imageUrl: `${ASSET_ROOT}/legs/${folder}/${color}.png` }
      }

      case 'shoes':
        return {
          category,
          zIndex: 8,
          imageUrl: `${ASSET_ROOT}/feet/shoes_male/idle.png`,
          recolorTargetHex: SHOE_COLORS.find((c) => c.id === colorId)?.swatch ?? SHOE_COLORS[0].swatch,
        }

      default:
        return null
    }
  },
}

export const LPC_DOWN_FRAME_POSITION = `0px ${DOWN_ROW_Y}px`

export const CATEGORY_LABELS: Record<AvatarLayerCategory, string> = {
  body: 'Cuerpo',
  head: 'Cabeza',
  eyes: 'Ojos',
  hair: 'Pelo',
  beard: 'Barba',
  mask: 'Máscara',
  shirt: 'Camisa',
  pants: 'Pantalón',
  shoes: 'Zapatos',
  cape: 'Capa',
  hat: 'Sombrero',
  backpack: 'Mochila',
  weapon: 'Arma',
  pet: 'Mascota',
}
