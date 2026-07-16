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

const ORC_SKIN_COLORS: ColorChoice[] = [
  { id: 'moss', label: 'Musgo', swatch: '#5a7a3a' },
  { id: 'swamp', label: 'Pantano', swatch: '#4a6a35' },
  { id: 'olive', label: 'Oliva', swatch: '#6a7a4a' },
  { id: 'ash', label: 'Ceniza', swatch: '#7a8a7a' },
]

const LIZARD_SKIN_COLORS: ColorChoice[] = [
  { id: 'emerald', label: 'Esmeralda', swatch: '#2f7a4f' },
  { id: 'jungle', label: 'Selva', swatch: '#3a6a3a' },
  { id: 'sand', label: 'Arena', swatch: '#8a8a4a' },
  { id: 'storm', label: 'Tormenta', swatch: '#4a5a6a' },
]

const SKELETON_SKIN_COLORS: ColorChoice[] = [
  { id: 'bone', label: 'Hueso', swatch: '#e8e0d0' },
  { id: 'ash', label: 'Ceniza', swatch: '#a8a49a' },
  { id: 'charred', label: 'Carbonizado', swatch: '#4a4540' },
]

const MASK_COLORS: ColorChoice[] = [
  { id: 'dark', label: 'Oscura', swatch: '#2a2a2a' },
  { id: 'light', label: 'Clara', swatch: '#e8e8e8' },
]

const HAIR_STYLES = ['none', 'plain', 'bangs', 'pixie', 'long', 'bob', 'curly_short', 'afro', 'jewfro'] as const
const HAIR_LABELS: Record<(typeof HAIR_STYLES)[number], string> = {
  none: 'Sin pelo',
  plain: 'Liso',
  bangs: 'Con flequillo',
  pixie: 'Pixie',
  long: 'Largo',
  bob: 'Bob',
  curly_short: 'Rizado corto',
  afro: 'Afro',
  jewfro: 'Afro rizado',
}

const PET_STYLES = ['none', 'peluche', 'rosa', 'cartera'] as const
const PET_LABELS: Record<(typeof PET_STYLES)[number], string> = {
  none: 'Ninguna',
  peluche: 'Peluche',
  rosa: 'Rosa',
  cartera: 'Cartera',
}

const EYE_STYLES = ['none', 'default', 'round'] as const
const EYE_STYLE_LABELS: Record<(typeof EYE_STYLES)[number], string> = {
  none: 'Sin ojos humanos',
  default: 'Ojos',
  round: 'Ojos grandes',
}

const SHOE_STYLES = ['none', 'default', 'heels'] as const
const SHOE_STYLE_LABELS: Record<(typeof SHOE_STYLES)[number], string> = {
  none: 'Sin zapatos',
  default: 'Zapatos',
  heels: 'Tacones',
}
const SHOE_STYLE_FOLDERS: Partial<Record<(typeof SHOE_STYLES)[number], string>> = {
  default: 'shoes_male',
  heels: 'shoes_heels',
}

/**
 * A body id encodes race + build together (e.g. 'orc_male', 'female_teen',
 * 'skeleton'). It drives which body AND head sprite render, and which skin
 * palette applies. `figure` is the clothing silhouette (male/female/muscular)
 * that id maps to — hair/shirt/pants/shoes keep keying off figure, since
 * every race reuses the same human clothing meshes.
 */
interface BodyDef {
  label: string
  figure: Figure
  bodyImage: string
  headImage: string
  skinColors: ColorChoice[]
  /** 'none' skips recoloring entirely — for bodies with fixed, non-skin-tone art (e.g. a penguin's black/white plumage). */
  colorMode?: 'recolor' | 'none'
  /** Non-humanoid costume bodies (penguin, astronaut) render their own full silhouette — human hair/shirt/pants/shoes don't fit, so those slots auto-clear to "none" when this body is picked. */
  hidesClothing?: boolean
}

const BODY_DEFS: Record<string, BodyDef> = {
  male: { label: 'Humano A', figure: 'male', bodyImage: 'male/idle.png', headImage: 'male/idle.png', skinColors: SKIN_COLORS },
  female: { label: 'Humano B', figure: 'female', bodyImage: 'female/idle.png', headImage: 'female/idle.png', skinColors: SKIN_COLORS },
  female_teen: { label: 'Humano B (esbelto)', figure: 'female', bodyImage: 'female_teen/idle.png', headImage: 'female/idle.png', skinColors: SKIN_COLORS },
  muscular: { label: 'Humano C (atlético)', figure: 'muscular', bodyImage: 'muscular/idle.png', headImage: 'male/idle.png', skinColors: SKIN_COLORS },
  orc_male: { label: 'Orco A', figure: 'male', bodyImage: 'male/idle.png', headImage: 'orc_male/idle.png', skinColors: ORC_SKIN_COLORS },
  orc_female: { label: 'Orco B', figure: 'female', bodyImage: 'female/idle.png', headImage: 'orc_female/idle.png', skinColors: ORC_SKIN_COLORS },
  lizard_male: { label: 'Argoniano A', figure: 'male', bodyImage: 'male/idle.png', headImage: 'lizard_male/idle.png', skinColors: LIZARD_SKIN_COLORS },
  lizard_female: { label: 'Argoniano B', figure: 'female', bodyImage: 'female/idle.png', headImage: 'lizard_female/idle.png', skinColors: LIZARD_SKIN_COLORS },
  skeleton: { label: 'No-muerto', figure: 'male', bodyImage: 'skeleton/walk.png', headImage: 'skeleton/idle.png', skinColors: SKELETON_SKIN_COLORS },
  penguin: { label: 'Pingüino', figure: 'male', bodyImage: 'penguin/idle.png', headImage: 'penguin/idle.png', skinColors: [], colorMode: 'none', hidesClothing: true },
  astronaut: { label: 'Astronauta', figure: 'male', bodyImage: 'astronaut/idle.png', headImage: 'astronaut/idle.png', skinColors: [], colorMode: 'none', hidesClothing: true },
}

export function figureOfBodyId(id: string): Figure {
  return BODY_DEFS[id]?.figure ?? 'male'
}

export function bodyHidesClothing(id: string): boolean {
  return BODY_DEFS[id]?.hidesClothing ?? false
}

type ShirtStyle = 'none' | 'vest' | 'tunic' | 'tshirt' | 'longsleeve'

const SHIRT_STYLES: Record<ShirtStyle, { label: string; figures: Figure[]; colorMode: 'baked' | 'recolor' | 'none' }> = {
  none: { label: 'Sin camisa', figures: ['male', 'female', 'muscular'], colorMode: 'none' },
  vest: { label: 'Chaleco', figures: ['male', 'muscular'], colorMode: 'baked' },
  tunic: { label: 'Túnica', figures: ['female'], colorMode: 'recolor' },
  tshirt: { label: 'Polera', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  longsleeve: { label: 'Camisa manga larga', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
}

type PantsStyle = 'none' | 'default' | 'shorts' | 'skirt'

const PANTS_STYLES: Record<PantsStyle, { label: string; figures: Figure[]; colorMode: 'baked' | 'recolor' | 'none' }> = {
  none: { label: 'Sin pantalón', figures: ['male', 'female', 'muscular'], colorMode: 'none' },
  default: { label: 'Pantalón', figures: ['male', 'female', 'muscular'], colorMode: 'baked' },
  shorts: { label: 'Short', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  skirt: { label: 'Falda', figures: ['female'], colorMode: 'recolor' },
}

const FRAME_SIZE = 64
const DOWN_ROW_Y = -(FRAME_SIZE * 2)

const ALL_FIGURES: Figure[] = ['male', 'female', 'muscular']

function bodyLayer(bodyId: string, colorId: string | undefined): ResolvedLayer {
  const def = BODY_DEFS[bodyId] ?? BODY_DEFS.male
  return {
    category: 'body',
    zIndex: 0,
    imageUrl: `${ASSET_ROOT}/body/${def.bodyImage}`,
    recolorTargetHex:
      def.colorMode === 'none' ? undefined : def.skinColors.find((c) => c.id === colorId)?.swatch ?? def.skinColors[0].swatch,
  }
}

function headLayer(bodyId: string, colorId: string | undefined): ResolvedLayer {
  const def = BODY_DEFS[bodyId] ?? BODY_DEFS.male
  return {
    category: 'head',
    zIndex: 2,
    imageUrl: `${ASSET_ROOT}/head/${def.headImage}`,
    recolorTargetHex:
      def.colorMode === 'none' ? undefined : def.skinColors.find((c) => c.id === colorId)?.swatch ?? def.skinColors[0].swatch,
  }
}

export const lpcProvider: AvatarAssetProvider = {
  id: 'lpc-universal',
  frameSize: FRAME_SIZE,
  categories: ['body', 'head', 'eyes', 'hair', 'mask', 'shirt', 'pants', 'shoes', 'pet'],
  attribution: {
    name: 'Liberated Pixel Cup — Universal LPC Spritesheet Character Generator',
    url: 'https://liberatedpixelcup.github.io/Universal-LPC-Spritesheet-Character-Generator/',
    license: 'CC-BY-SA 3.0 / GPL 3.0',
  },

  listOptions(category, figure): LayerOption[] {
    switch (category) {
      case 'body':
        return Object.entries(BODY_DEFS).map(([id, def]) => ({
          id,
          label: def.label,
          figures: [def.figure],
          colorMode: def.colorMode ?? 'recolor',
          colors: def.skinColors,
        }))

      case 'head':
        return [{ id: figure, label: 'Cabeza', figures: [figure], colorMode: 'recolor', colors: SKIN_COLORS }]

      case 'eyes':
        return EYE_STYLES.map((style) => ({
          id: style,
          label: EYE_STYLE_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: style === 'none' ? 'none' : 'recolor',
          colors: style === 'none' ? [] : EYE_COLORS,
        }))

      case 'hair':
        return HAIR_STYLES.map((style) => ({
          id: style,
          label: HAIR_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: style === 'none' ? 'none' : 'recolor',
          colors: style === 'none' ? [] : HAIR_COLORS,
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
        return (Object.entries(PANTS_STYLES) as [PantsStyle, (typeof PANTS_STYLES)[PantsStyle]][])
          .filter(([, def]) => def.figures.includes(figure))
          .map(([id, def]) => ({
            id,
            label: def.label,
            figures: def.figures,
            colorMode: def.colorMode,
            colors: GARMENT_COLORS,
          }))

      case 'shoes':
        return SHOE_STYLES.map((style) => ({
          id: style,
          label: SHOE_STYLE_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: style === 'none' ? 'none' : 'recolor',
          colors: style === 'none' ? [] : SHOE_COLORS,
        }))

      case 'pet':
        return PET_STYLES.map((style) => ({
          id: style,
          label: PET_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: 'none',
          colors: [],
        }))

      default:
        return []
    }
  },

  resolveLayer(category, optionId, colorId, figure): ResolvedLayer | null {
    switch (category) {
      case 'body':
        return bodyLayer(optionId, colorId)

      case 'head':
        return headLayer(optionId, colorId)

      case 'eyes':
        if (optionId === 'none') return null
        return {
          category,
          zIndex: 5,
          imageUrl: `${ASSET_ROOT}/eyes/${optionId}/idle.png`,
          recolorTargetHex: EYE_COLORS.find((c) => c.id === colorId)?.swatch ?? EYE_COLORS[0].swatch,
        }

      case 'hair':
        if (optionId === 'none') return null
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

        if (style === 'none') return null

        if (style === 'vest') {
          return { category, zIndex: 20, imageUrl: `${ASSET_ROOT}/torso/vest_male/${color}.png` }
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
        const style = (optionId as PantsStyle) in PANTS_STYLES ? (optionId as PantsStyle) : 'default'
        const color = colorId ?? 'blue'

        if (style === 'none') return null

        if (style === 'default') {
          const folder = figure === 'female' ? 'pants_female' : figure === 'muscular' ? 'pants_muscular' : 'pants_male'
          return { category, zIndex: 10, imageUrl: `${ASSET_ROOT}/legs/${folder}/${color}.png` }
        }

        return {
          category,
          zIndex: 10,
          imageUrl: `${ASSET_ROOT}/legs/${style}/idle.png`,
          recolorTargetHex: GARMENT_COLORS.find((c) => c.id === color)?.swatch ?? GARMENT_COLORS[0].swatch,
        }
      }

      case 'shoes': {
        if (optionId === 'none') return null
        type ShoeStyle = (typeof SHOE_STYLES)[number]
        const style = (optionId as ShoeStyle) in SHOE_STYLE_FOLDERS ? (optionId as ShoeStyle) : 'default'
        const folder = SHOE_STYLE_FOLDERS[style]
        return {
          category,
          zIndex: 8,
          imageUrl: `${ASSET_ROOT}/feet/${folder}/idle.png`,
          recolorTargetHex: SHOE_COLORS.find((c) => c.id === colorId)?.swatch ?? SHOE_COLORS[0].swatch,
        }
      }

      case 'pet':
        if (optionId === 'none') return null
        return {
          category,
          zIndex: 25,
          imageUrl: `${ASSET_ROOT}/pet/${optionId}/idle.png`,
        }

      default:
        return null
    }
  },
}

export const LPC_DOWN_FRAME_POSITION = `0px ${DOWN_ROW_Y}px`

export const CATEGORY_LABELS: Record<AvatarLayerCategory, string> = {
  body: 'Raza y cuerpo',
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
