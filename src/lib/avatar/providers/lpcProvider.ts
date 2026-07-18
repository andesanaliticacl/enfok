import type { AvatarAssetProvider, AvatarLayerCategory, ColorChoice, Figure, LayerOption, ResolvedLayer } from '@/lib/avatar/types'

const ASSET_ROOT = '/assets/lpc'

const GARMENT_COLORS: ColorChoice[] = [
  { id: 'black', label: 'Negro', swatch: '#1c1c1c' },
  { id: 'white', label: 'Blanco', swatch: '#e8e8e8' },
  { id: 'blue', label: 'Azul', swatch: '#2f5fa8' },
  { id: 'teal', label: 'Turquesa', swatch: '#2f8a8a' },
  { id: 'forest', label: 'Verde bosque', swatch: '#2f5a3a' },
  { id: 'gold', label: 'Dorado', swatch: '#b8912f' },
  { id: 'orange', label: 'Naranja', swatch: '#c96a2f' },
  { id: 'maroon', label: 'Granate', swatch: '#6e2632' },
  { id: 'purple', label: 'Púrpura', swatch: '#5f3a8c' },
  { id: 'pink', label: 'Rosa', swatch: '#c96a9a' },
  { id: 'brown', label: 'Café', swatch: '#5a3a22' },
  { id: 'gray', label: 'Gris', swatch: '#7a7a7a' },
]

const HAIR_COLORS: ColorChoice[] = [
  { id: 'black', label: 'Negro', swatch: '#1a1a1a' },
  { id: 'brown', label: 'Castaño', swatch: '#4a2c17' },
  { id: 'chestnut', label: 'Castaño claro', swatch: '#7a4a2a' },
  { id: 'blonde', label: 'Rubio', swatch: '#d4af6a' },
  { id: 'platinum', label: 'Platinado', swatch: '#e8dcc8' },
  { id: 'red', label: 'Pelirrojo', swatch: '#8b3a2a' },
  { id: 'gray', label: 'Canoso', swatch: '#9a9a9a' },
  { id: 'white', label: 'Blanco', swatch: '#eeeeee' },
  { id: 'blue', label: 'Azul fantasía', swatch: '#3a5a8c' },
  { id: 'green', label: 'Verde fantasía', swatch: '#3a7a4a' },
  { id: 'pink', label: 'Rosa fantasía', swatch: '#c9709a' },
  { id: 'purple', label: 'Violeta fantasía', swatch: '#6a4a9a' },
]

const EYE_COLORS: ColorChoice[] = [
  { id: 'brown', label: 'Café', swatch: '#4a2c17' },
  { id: 'blue', label: 'Azul', swatch: '#3a6ea5' },
  { id: 'green', label: 'Verde', swatch: '#3f7a4f' },
  { id: 'gray', label: 'Gris', swatch: '#8a8f99' },
  { id: 'amber', label: 'Ámbar', swatch: '#b5792f' },
  { id: 'hazel', label: 'Avellana', swatch: '#7a6a3a' },
  { id: 'red', label: 'Rojo', swatch: '#a53a3a' },
  { id: 'purple', label: 'Violeta', swatch: '#7a4a9a' },
  { id: 'yellow', label: 'Dorado', swatch: '#c9a52f' },
]

const SKIN_COLORS: ColorChoice[] = [
  { id: 'porcelain', label: 'Porcelana', swatch: '#f2d6bb' },
  { id: 'light', label: 'Clara', swatch: '#e8b892' },
  { id: 'medium', label: 'Media', swatch: '#c98a5c' },
  { id: 'tan', label: 'Trigueña', swatch: '#a86c42' },
  { id: 'dark', label: 'Morena', swatch: '#7a4a2a' },
  { id: 'deep', label: 'Oscura', swatch: '#4a2f1c' },
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

const FUR_COLORS: ColorChoice[] = [
  { id: 'gray', label: 'Gris', swatch: '#8a8a8a' },
  { id: 'brown', label: 'Café', swatch: '#6a4a2a' },
  { id: 'black', label: 'Negro', swatch: '#2f2f2f' },
  { id: 'white', label: 'Blanco', swatch: '#e0e0e0' },
  { id: 'red', label: 'Rojizo', swatch: '#8b4a2a' },
]

const VAMPIRE_SKIN_COLORS: ColorChoice[] = [
  { id: 'pale', label: 'Pálido', swatch: '#e8d6c0' },
  { id: 'cadaver', label: 'Cadavérico', swatch: '#cfc8b8' },
  { id: 'lilac', label: 'Lila', swatch: '#c0b0c8' },
]

const GOBLIN_SKIN_COLORS: ColorChoice[] = [
  { id: 'green', label: 'Verde', swatch: '#5a8a3a' },
  { id: 'olive', label: 'Oliva', swatch: '#7a8a4a' },
  { id: 'gray', label: 'Gris', swatch: '#8a9a8a' },
]

const ZOMBIE_SKIN_COLORS: ColorChoice[] = [
  { id: 'rot', label: 'Putrefacto', swatch: '#7a8a6a' },
  { id: 'pale', label: 'Pálido', swatch: '#9a9a8a' },
  { id: 'bruise', label: 'Amoratado', swatch: '#6a7a7a' },
]

const RABBIT_FUR_COLORS: ColorChoice[] = [
  { id: 'white', label: 'Blanco', swatch: '#e8e8e8' },
  { id: 'gray', label: 'Gris', swatch: '#b8b8b8' },
  { id: 'brown', label: 'Café', swatch: '#8a6a4a' },
  { id: 'cream', label: 'Crema', swatch: '#e8d8b8' },
]

const MASK_COLORS: ColorChoice[] = [
  { id: 'dark', label: 'Oscura', swatch: '#2a2a2a' },
  { id: 'light', label: 'Clara', swatch: '#e8e8e8' },
]

const HAIR_STYLES = [
  'none', 'plain', 'bangs', 'pixie', 'long', 'bob', 'curly_short', 'afro', 'jewfro',
  'bangs_bun', 'bedhead', 'buzzcut', 'cornrows', 'curly_long', 'curtains', 'dreadlocks_long',
  'dreadlocks_short', 'flat_top_fade', 'half_up', 'idol', 'long_straight', 'longhawk',
  'messy1', 'mop', 'natural', 'page', 'pigtails', 'shorthawk', 'spiked', 'swoop',
  'twists_fade', 'unkempt',
] as const

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
  bangs_bun: 'Moño con flequillo',
  bedhead: 'Recién levantado',
  buzzcut: 'Rapado',
  cornrows: 'Trenzas pegadas',
  curly_long: 'Rizado largo',
  curtains: 'Cortinas',
  dreadlocks_long: 'Rastas largas',
  dreadlocks_short: 'Rastas cortas',
  flat_top_fade: 'Flat top',
  half_up: 'Semirecogido',
  idol: 'Idol',
  long_straight: 'Largo liso',
  longhawk: 'Mohawk largo',
  messy1: 'Despeinado',
  mop: 'Mota',
  natural: 'Natural',
  page: 'Paje',
  pigtails: 'Coletas',
  shorthawk: 'Mohawk corto',
  spiked: 'Puntas',
  swoop: 'Flequillo lateral',
  twists_fade: 'Twists',
  unkempt: 'Salvaje',
}

const BEARD_STYLES = [
  'none', '5oclock_shadow', 'basic', 'medium', 'trimmed',
  'mustache_basic', 'mustache_bigstache', 'mustache_french', 'mustache_handlebar',
] as const

const BEARD_LABELS: Record<(typeof BEARD_STYLES)[number], string> = {
  none: 'Sin barba',
  '5oclock_shadow': 'Barba de tres días',
  basic: 'Barba corta',
  medium: 'Barba media',
  trimmed: 'Barba perfilada',
  mustache_basic: 'Bigote',
  mustache_bigstache: 'Bigotazo',
  mustache_french: 'Bigote francés',
  mustache_handlebar: 'Bigote manubrio',
}

/**
 * Eye expressions from the LPC catalog. The truly bestial eyes (cat slits,
 * reptile pupils) come baked into the race heads (lobo, argoniano, goblin...) —
 * at 64px the eye layer itself is a few pixels, so expression + color is what
 * it can carry.
 */
const EYE_STYLES = ['default', 'neutral', 'anger', 'sad', 'shock'] as const
const EYE_STYLE_LABELS: Record<(typeof EYE_STYLES)[number], string> = {
  default: 'Despiertos',
  neutral: 'Serenos',
  anger: 'Feroces',
  sad: 'Melancólicos',
  shock: 'Asombrados',
}

// "Máscara" and the hats/helmets share one head slot — no room for both.
type HatStyle =
  | 'none' | 'mask' | 'wizard' | 'crown' | 'tiara' | 'tophat' | 'tricorne'
  | 'bandana' | 'horned' | 'legion' | 'xeon'

const HAT_STYLES: Record<HatStyle, { label: string; colorMode: 'baked' | 'none'; colors: ColorChoice[] }> = {
  none: { label: 'Ninguno', colorMode: 'none', colors: [] },
  mask: { label: 'Máscara', colorMode: 'baked', colors: MASK_COLORS },
  wizard: { label: 'Sombrero de mago', colorMode: 'none', colors: [] },
  crown: { label: 'Corona', colorMode: 'none', colors: [] },
  tiara: { label: 'Tiara', colorMode: 'none', colors: [] },
  tophat: { label: 'Sombrero de copa', colorMode: 'none', colors: [] },
  tricorne: { label: 'Tricornio pirata', colorMode: 'none', colors: [] },
  bandana: { label: 'Bandana', colorMode: 'none', colors: [] },
  horned: { label: 'Casco vikingo', colorMode: 'none', colors: [] },
  legion: { label: 'Casco de legión', colorMode: 'none', colors: [] },
  xeon: { label: 'Casco futurista', colorMode: 'none', colors: [] },
}

const SHOE_STYLES = ['none', 'default', 'boots', 'sandals', 'slippers', 'heels'] as const
const SHOE_STYLE_LABELS: Record<(typeof SHOE_STYLES)[number], string> = {
  none: 'Descalzo',
  default: 'Zapatos',
  boots: 'Botas',
  sandals: 'Sandalias',
  slippers: 'Pantuflas',
  heels: 'Tacones',
}

/**
 * A body id encodes race + build together (e.g. 'orc_male', 'wolf_female').
 * It drives which body AND head sprite render, and which skin palette applies.
 * `figure` is the clothing silhouette (male/female/muscular) that id maps to —
 * clothing keeps keying off figure, since every race reuses the human meshes.
 * Races with a single unisex head upstream ship one entry on the male body.
 */
interface BodyDef {
  label: string
  figure: Figure
  bodyImage: string
  headImage: string
  skinColors: ColorChoice[]
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
  wolf_male: { label: 'Lobo A', figure: 'male', bodyImage: 'male/idle.png', headImage: 'wolf_male/idle.png', skinColors: FUR_COLORS },
  wolf_female: { label: 'Lobo B', figure: 'female', bodyImage: 'female/idle.png', headImage: 'wolf_female/idle.png', skinColors: FUR_COLORS },
  minotaur_male: { label: 'Minotauro A', figure: 'male', bodyImage: 'male/idle.png', headImage: 'minotaur_male/idle.png', skinColors: FUR_COLORS },
  minotaur_female: { label: 'Minotauro B', figure: 'female', bodyImage: 'female/idle.png', headImage: 'minotaur_female/idle.png', skinColors: FUR_COLORS },
  vampire: { label: 'Vampiro', figure: 'male', bodyImage: 'male/idle.png', headImage: 'vampire/idle.png', skinColors: VAMPIRE_SKIN_COLORS },
  goblin: { label: 'Goblin', figure: 'male', bodyImage: 'male/idle.png', headImage: 'goblin/idle.png', skinColors: GOBLIN_SKIN_COLORS },
  troll: { label: 'Troll', figure: 'male', bodyImage: 'male/idle.png', headImage: 'troll/idle.png', skinColors: GOBLIN_SKIN_COLORS },
  zombie: { label: 'Zombi', figure: 'male', bodyImage: 'male/idle.png', headImage: 'zombie/idle.png', skinColors: ZOMBIE_SKIN_COLORS },
  rabbit: { label: 'Conejo', figure: 'male', bodyImage: 'male/idle.png', headImage: 'rabbit/idle.png', skinColors: RABBIT_FUR_COLORS },
  skeleton: { label: 'No-muerto', figure: 'male', bodyImage: 'skeleton/walk.png', headImage: 'skeleton/idle.png', skinColors: SKELETON_SKIN_COLORS },
}

export function figureOfBodyId(id: string): Figure {
  return BODY_DEFS[id]?.figure ?? 'male'
}

/** Helmets/hats are full pre-shaded art that may need resizing to fit different head shapes — the flat mask doesn't. */
export function isHatResizable(optionId: string): boolean {
  return optionId !== 'none' && optionId !== 'mask'
}

type ShirtStyle = 'none' | 'vest' | 'tunic' | 'tshirt' | 'longsleeve' | 'shortsleeve' | 'sleeveless' | 'leather'

const SHIRT_STYLES: Record<ShirtStyle, { label: string; figures: Figure[]; colorMode: 'baked' | 'recolor' | 'none' }> = {
  none: { label: 'Sin camisa', figures: ['male', 'female', 'muscular'], colorMode: 'none' },
  tshirt: { label: 'Polera', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  shortsleeve: { label: 'Manga corta', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  sleeveless: { label: 'Sin mangas', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  longsleeve: { label: 'Manga larga', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  tunic: { label: 'Túnica', figures: ['female'], colorMode: 'recolor' },
  vest: { label: 'Chaleco', figures: ['male', 'muscular'], colorMode: 'baked' },
  leather: { label: 'Armadura de cuero', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
}

type PantsStyle = 'none' | 'default' | 'shorts' | 'skirt' | 'cuffed' | 'formal' | 'leggings' | 'pantaloons'

const PANTS_STYLES: Record<PantsStyle, { label: string; figures: Figure[]; colorMode: 'baked' | 'recolor' | 'none' }> = {
  none: { label: 'Sin pantalón', figures: ['male', 'female', 'muscular'], colorMode: 'none' },
  default: { label: 'Pantalón', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  shorts: { label: 'Short', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  cuffed: { label: 'Pantalón arremangado', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  formal: { label: 'Pantalón formal', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  leggings: { label: 'Calzas', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  pantaloons: { label: 'Pantalones bombachos', figures: ['male', 'female', 'muscular'], colorMode: 'recolor' },
  skirt: { label: 'Falda', figures: ['female'], colorMode: 'recolor' },
}

const FRAME_SIZE = 64
const DOWN_ROW_Y = -(FRAME_SIZE * 2)

const ALL_FIGURES: Figure[] = ['male', 'female', 'muscular']

/** Maps a clothing figure to the asset folder suffix (muscular reuses the male meshes we ship). */
function clothingSuffix(figure: Figure): 'male' | 'female' {
  return figure === 'female' ? 'female' : 'male'
}

function bodyLayer(bodyId: string, colorId: string | undefined): ResolvedLayer {
  const def = BODY_DEFS[bodyId] ?? BODY_DEFS.male
  return {
    category: 'body',
    zIndex: 0,
    imageUrl: `${ASSET_ROOT}/body/${def.bodyImage}`,
    recolorTargetHex: def.skinColors.find((c) => c.id === colorId)?.swatch ?? def.skinColors[0].swatch,
  }
}

function headLayer(bodyId: string, colorId: string | undefined): ResolvedLayer {
  const def = BODY_DEFS[bodyId] ?? BODY_DEFS.male
  return {
    category: 'head',
    zIndex: 2,
    imageUrl: `${ASSET_ROOT}/head/${def.headImage}`,
    recolorTargetHex: def.skinColors.find((c) => c.id === colorId)?.swatch ?? def.skinColors[0].swatch,
  }
}

export const lpcProvider: AvatarAssetProvider = {
  id: 'lpc-universal',
  frameSize: FRAME_SIZE,
  categories: ['body', 'head', 'eyes', 'beard', 'hair', 'shirt', 'pants', 'shoes', 'hat'],
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
          colorMode: 'recolor',
          colors: def.skinColors,
        }))

      case 'head':
        return [{ id: figure, label: 'Cabeza', figures: [figure], colorMode: 'recolor', colors: SKIN_COLORS }]

      case 'eyes':
        return EYE_STYLES.map((style) => ({
          id: style,
          label: EYE_STYLE_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: 'recolor',
          colors: EYE_COLORS,
        }))

      case 'hair':
        return HAIR_STYLES.map((style) => ({
          id: style,
          label: HAIR_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: style === 'none' ? 'none' : 'recolor',
          colors: style === 'none' ? [] : HAIR_COLORS,
        }))

      case 'beard':
        return BEARD_STYLES.map((style) => ({
          id: style,
          label: BEARD_LABELS[style],
          figures: ALL_FIGURES,
          colorMode: style === 'none' ? 'none' : 'recolor',
          colors: style === 'none' ? [] : HAIR_COLORS,
        }))

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
          colors: style === 'none' ? [] : GARMENT_COLORS,
        }))

      case 'hat':
        return (Object.entries(HAT_STYLES) as [HatStyle, (typeof HAT_STYLES)[HatStyle]][]).map(([id, def]) => ({
          id,
          label: def.label,
          figures: ALL_FIGURES,
          colorMode: def.colorMode,
          colors: def.colors,
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

      case 'eyes': {
        const style = (EYE_STYLES as readonly string[]).includes(optionId) ? optionId : 'default'
        return {
          category,
          zIndex: 5,
          imageUrl: `${ASSET_ROOT}/eyes/${style}/idle.png`,
          recolorTargetHex: EYE_COLORS.find((c) => c.id === colorId)?.swatch ?? EYE_COLORS[0].swatch,
        }
      }

      case 'beard':
        if (optionId === 'none' || !(BEARD_STYLES as readonly string[]).includes(optionId)) return null
        return {
          category,
          zIndex: 6,
          imageUrl: `${ASSET_ROOT}/beard/${optionId}/idle.png`,
          recolorTargetHex: HAIR_COLORS.find((c) => c.id === colorId)?.swatch ?? HAIR_COLORS[1].swatch,
        }

      case 'hair':
        if (optionId === 'none') return null
        return {
          category,
          zIndex: 30,
          imageUrl: `${ASSET_ROOT}/hair/${optionId}/idle.png`,
          recolorTargetHex: HAIR_COLORS.find((c) => c.id === colorId)?.swatch ?? HAIR_COLORS[0].swatch,
        }

      case 'shirt': {
        const style = (optionId as ShirtStyle) in SHIRT_STYLES ? (optionId as ShirtStyle) : 'tshirt'
        const color = colorId ?? 'blue'

        if (style === 'none') return null

        if (style === 'vest') {
          const vestColor = ['black', 'blue', 'brown', 'forest', 'gray', 'maroon'].includes(color) ? color : 'blue'
          return { category, zIndex: 20, imageUrl: `${ASSET_ROOT}/torso/vest_male/${vestColor}.png` }
        }

        const folder = style === 'tunic' ? 'tunic_female' : `${style}_${clothingSuffix(figure)}`
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

        let folder: string
        if (style === 'skirt') {
          folder = 'skirt'
        } else if (style === 'default') {
          folder = figure === 'female' ? 'pants_female' : figure === 'muscular' ? 'pants_muscular' : 'pants_male'
        } else if (style === 'pantaloons' && figure === 'muscular') {
          folder = 'pantaloons_muscular'
        } else {
          folder = `${style}_${clothingSuffix(figure)}`
        }
        return {
          category,
          zIndex: 10,
          imageUrl: `${ASSET_ROOT}/legs/${folder}/idle.png`,
          recolorTargetHex: GARMENT_COLORS.find((c) => c.id === color)?.swatch ?? GARMENT_COLORS[0].swatch,
        }
      }

      case 'shoes': {
        if (optionId === 'none') return null
        type ShoeStyle = (typeof SHOE_STYLES)[number]
        const style = (SHOE_STYLES as readonly string[]).includes(optionId) ? (optionId as ShoeStyle) : 'default'
        const folder =
          style === 'default' ? 'shoes_male'
          : style === 'heels' ? 'shoes_heels'
          : `${style}_${clothingSuffix(figure)}`
        return {
          category,
          zIndex: 8,
          imageUrl: `${ASSET_ROOT}/feet/${folder}/idle.png`,
          recolorTargetHex: GARMENT_COLORS.find((c) => c.id === colorId)?.swatch ?? GARMENT_COLORS[10].swatch,
        }
      }

      case 'hat':
        if (optionId === 'none' || !(optionId in HAT_STYLES)) return null
        if (optionId === 'mask') {
          return {
            category,
            zIndex: 35,
            imageUrl: `${ASSET_ROOT}/facial/masks_plain/${colorId ?? 'dark'}.png`,
          }
        }
        return {
          category,
          zIndex: 40,
          imageUrl: `${ASSET_ROOT}/hat/${optionId}/idle.png`,
        }

      default:
        return null
    }
  },
}

export const LPC_DOWN_FRAME_POSITION = `0px ${DOWN_ROW_Y}px`
/** X offset of the second idle frame (the breathing/blink frame) in a 128px-wide idle sheet. */
export const LPC_IDLE_FRAME_2_X = -FRAME_SIZE

export const CATEGORY_LABELS: Record<AvatarLayerCategory, string> = {
  body: 'Raza y cuerpo',
  head: 'Cabeza',
  eyes: 'Ojos',
  hair: 'Pelo',
  beard: 'Barba',
  mask: 'Máscara',
  shirt: 'Torso',
  pants: 'Piernas',
  shoes: 'Calzado',
  cape: 'Capa',
  hat: 'Sombreros y cascos',
  backpack: 'Mochila',
  weapon: 'Arma',
  pet: 'Compañero',
}
// 'pet' stays in the label map for type completeness, but the category was
// retired — companions now live as stickers on the player's biome instead.
