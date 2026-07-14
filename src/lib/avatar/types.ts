export type Figure = 'male' | 'female' | 'muscular'

export type AvatarLayerCategory =
  | 'body'
  | 'eyes'
  | 'hair'
  | 'beard'
  | 'mask'
  | 'shirt'
  | 'pants'
  | 'shoes'
  | 'cape'
  | 'hat'
  | 'backpack'
  | 'weapon'
  | 'pet'

/** A selectable color for a layer. `value` is either a hex (recolor engine) or a baked asset color id. */
export interface ColorChoice {
  id: string
  label: string
  swatch: string
}

export interface LayerOption {
  id: string
  label: string
  figures: Figure[]
  colorMode: 'baked' | 'recolor' | 'none'
  colors: ColorChoice[]
}

export interface ResolvedLayer {
  category: AvatarLayerCategory
  zIndex: number
  imageUrl: string
  recolorTargetHex?: string
}

export interface AvatarConfig {
  figure: Figure
  options: Partial<Record<AvatarLayerCategory, string>>
  colors: Partial<Record<AvatarLayerCategory, string>>
}

/**
 * Abstraction boundary between the game/UI and the concrete art source.
 * Swap the implementation (LPC today, custom sprites tomorrow) without
 * touching AvatarSprite, the creation screen, or the game store.
 */
export interface AvatarAssetProvider {
  id: string
  frameSize: number
  categories: AvatarLayerCategory[]
  listOptions(category: AvatarLayerCategory, figure: Figure): LayerOption[]
  resolveLayer(
    category: AvatarLayerCategory,
    optionId: string,
    colorId: string | undefined,
    figure: Figure,
  ): ResolvedLayer | null
  attribution: { name: string; url: string; license: string }
}
