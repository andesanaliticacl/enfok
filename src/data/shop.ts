/** The coin sink: everything missions pay out can be spent here on visible personalization. */

export type ShopCategory = 'titulo' | 'aura' | 'stickers'

export interface ShopItem {
  /** Also the unlock key stored in game state — never rename ids once shipped. */
  id: string
  category: ShopCategory
  name: string
  description: string
  icon: string
  price: number
  /** Sticker packs only: the emojis the pack adds to the biome decorator. */
  stickers?: string[]
}

export const SHOP_ITEMS: ShopItem[] = [
  // Equipable titles — shown under the player's name on the profile hero.
  { id: 'title:madrugador', category: 'titulo', name: 'Madrugador Legendario', description: 'Para quien conquista el día antes que el sol.', icon: '🌅', price: 40 },
  { id: 'title:forjador', category: 'titulo', name: 'Forjador de Hábitos', description: 'Cada día, un golpe más en el yunque.', icon: '⚒️', price: 60 },
  { id: 'title:cazador', category: 'titulo', name: 'Cazador de Sombras', description: 'Ninguna misión pendiente escapa de ti.', icon: '🗡️', price: 60 },
  { id: 'title:senor-rachas', category: 'titulo', name: 'Señor de las Rachas', description: 'El fuego de tu constancia no se apaga.', icon: '🔥', price: 80 },
  { id: 'title:alma-hierro', category: 'titulo', name: 'Alma de Hierro', description: 'Disciplina forjada sesión a sesión.', icon: '🛡️', price: 100 },
  { id: 'title:guardian-oro', category: 'titulo', name: 'Guardián del Oro', description: 'Tus finanzas, bajo llave y creciendo.', icon: '👑', price: 120 },

  // Avatar auras — an animated glow around the character on the profile hero.
  { id: 'aura:dorada', category: 'aura', name: 'Aura Dorada', description: 'Un resplandor cálido de campeón.', icon: '✨', price: 150 },
  { id: 'aura:esmeralda', category: 'aura', name: 'Aura Esmeralda', description: 'La energía serena del bosque.', icon: '💚', price: 150 },
  { id: 'aura:fuego', category: 'aura', name: 'Aura de Fuego', description: 'Arde con la fuerza de tu racha.', icon: '🔥', price: 200 },
  { id: 'aura:sombria', category: 'aura', name: 'Aura Sombría', description: 'Un manto violeta de misterio.', icon: '🌑', price: 200 },
  { id: 'aura:estelar', category: 'aura', name: 'Aura Estelar', description: 'Polvo de estrellas orbitando tu leyenda.', icon: '🌌', price: 250 },

  // Sticker packs — extra emojis for decorating the biome.
  { id: 'stickers:criaturas', category: 'stickers', name: 'Pack Criaturas', description: 'Compañeros salvajes para tu mundo.', icon: '🐉', price: 70, stickers: ['🐉', '🦊', '🦉', '🐢', '🦌'] },
  { id: 'stickers:cosmico', category: 'stickers', name: 'Pack Cósmico', description: 'Tu bioma, con vista al universo.', icon: '🪐', price: 80, stickers: ['🪐', '🌠', '👾', '🛸', '🌌'] },
  { id: 'stickers:legendario', category: 'stickers', name: 'Pack Legendario', description: 'Reliquias dignas de un héroe.', icon: '⚔️', price: 90, stickers: ['🏰', '⚔️', '🛡️', '👑', '🔮'] },
]

export function shopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

/** Extra biome stickers granted by every unlocked pack. */
export function unlockedStickers(unlocks: string[]): string[] {
  return SHOP_ITEMS.filter((i) => i.category === 'stickers' && unlocks.includes(i.id)).flatMap((i) => i.stickers ?? [])
}
