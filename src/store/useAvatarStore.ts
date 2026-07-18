import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import type { AvatarConfig } from '@/lib/avatar/types'
import type { BiomeId } from '@/types'

const DEFAULT_AVATAR: AvatarConfig = {
  figure: 'male',
  options: {
    body: 'male',
    head: 'male',
    eyes: 'default',
    hair: 'plain',
    beard: 'none',
    shirt: 'tshirt',
    pants: 'default',
    shoes: 'default',
    hat: 'none',
    pet: 'none',
  },
  colors: {
    body: 'light',
    head: 'light',
    eyes: 'brown',
    hair: 'brown',
    beard: 'brown',
    hat: 'dark',
    shirt: 'blue',
    pants: 'gray',
    shoes: 'brown',
  },
  pixelOverrides: {},
  hatScale: 1,
}

/** Options whose assets were retired (hand-made helmets, the old 'round' eyes) mapped to their replacements. */
const RETIRED_OPTIONS: Partial<Record<keyof AvatarConfig['options'], Record<string, string>>> = {
  hat: { astronaut_helmet: 'xeon', penguin_helmet: 'none' },
  eyes: { round: 'default' },
}

function migrateRetiredOptions(options: AvatarConfig['options']): AvatarConfig['options'] {
  const next = { ...options }
  for (const [category, mapping] of Object.entries(RETIRED_OPTIONS) as [keyof AvatarConfig['options'], Record<string, string>][]) {
    const current = next[category]
    if (current && mapping[current]) next[category] = mapping[current]
  }
  return next
}

export const HAT_SCALE_MIN = 0.6
export const HAT_SCALE_MAX = 1.5
export const HAT_SCALE_STEP = 0.1

export type BiomeVariant = 'light' | 'dark'

interface AvatarState {
  hasCreatedCharacter: boolean
  avatar: AvatarConfig
  biome: BiomeId | null
  biomeArt: string | null
  biomeVariant: BiomeVariant
  setFigure: (figure: AvatarConfig['figure']) => void
  setOption: (category: keyof AvatarConfig['options'], optionId: string) => void
  setColor: (category: keyof AvatarConfig['colors'], colorId: string) => void
  setHatScale: (scale: number) => void
  setBiome: (biome: BiomeId) => void
  setBiomeArt: (dataUrl: string) => void
  clearBiomeArt: () => void
  setBiomeVariant: (variant: BiomeVariant) => void
  setPixelOverride: (category: keyof AvatarConfig['options'], dataUrl: string) => void
  clearPixelOverride: (category: keyof AvatarConfig['options']) => void
  finishCreation: () => void
  deleteCharacter: () => void
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      hasCreatedCharacter: false,
      avatar: DEFAULT_AVATAR,
      biome: null,
      biomeArt: null,
      biomeVariant: 'light',

      setFigure: (figure) =>
        set((state) => {
          const options: AvatarConfig['options'] = { ...state.avatar.options, body: figure, head: figure }

          // Some clothing styles (e.g. vest, tunic) only exist for certain
          // figures — fall back to the first valid style instead of showing
          // mismatched art.
          for (const category of lpcProvider.categories) {
            const currentOptionId = options[category]
            const validOptions = lpcProvider.listOptions(category, figure)
            if (currentOptionId && !validOptions.some((o) => o.id === currentOptionId)) {
              options[category] = validOptions[0]?.id
            }
          }

          return { avatar: { ...state.avatar, figure, options } }
        }),

      setOption: (category, optionId) =>
        set((state) => {
          // Painted pixels are shape-specific to whichever style was active when
          // painted (e.g. a t-shirt's short sleeves) — carrying them over to a
          // different style (e.g. long sleeves) shows a mismatched silhouette,
          // so switching styles drops any custom paint for that slot.
          const pixelOverrides = { ...state.avatar.pixelOverrides }
          if (state.avatar.options[category] !== optionId) delete pixelOverrides[category]

          return {
            avatar: { ...state.avatar, options: { ...state.avatar.options, [category]: optionId }, pixelOverrides },
          }
        }),

      setColor: (category, colorId) =>
        set((state) => {
          const colors = { ...state.avatar.colors, [category]: colorId }
          // Head and body are always the same skin tone from the user's perspective.
          if (category === 'body') colors.head = colorId
          return { avatar: { ...state.avatar, colors } }
        }),

      setHatScale: (scale) =>
        set((state) => ({
          avatar: { ...state.avatar, hatScale: Math.min(HAT_SCALE_MAX, Math.max(HAT_SCALE_MIN, scale)) },
        })),

      setBiome: (biome) => set({ biome }),

      setBiomeArt: (dataUrl) => set({ biomeArt: dataUrl }),

      clearBiomeArt: () => set({ biomeArt: null }),

      setBiomeVariant: (variant) => set({ biomeVariant: variant }),

      setPixelOverride: (category, dataUrl) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            pixelOverrides: { ...state.avatar.pixelOverrides, [category]: dataUrl },
          },
        })),

      clearPixelOverride: (category) =>
        set((state) => {
          const pixelOverrides = { ...state.avatar.pixelOverrides }
          delete pixelOverrides[category]
          return { avatar: { ...state.avatar, pixelOverrides } }
        }),

      finishCreation: () => set({ hasCreatedCharacter: true }),

      deleteCharacter: () => set({ hasCreatedCharacter: false, avatar: DEFAULT_AVATAR, biome: null, biomeArt: null }),
    }),
    {
      name: 'questly-avatar-state',
      // Deep-merge persisted state onto the defaults so a browser that saved
      // an older AvatarConfig shape (missing fields we've added since, like
      // pixelOverrides) doesn't crash the app — it just backfills defaults.
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<AvatarState>
        return {
          ...current,
          ...persistedState,
          avatar: {
            ...current.avatar,
            ...persistedState.avatar,
            options: migrateRetiredOptions({ ...current.avatar.options, ...persistedState.avatar?.options }),
            colors: { ...current.avatar.colors, ...persistedState.avatar?.colors },
            pixelOverrides: { ...current.avatar.pixelOverrides, ...persistedState.avatar?.pixelOverrides },
          },
        }
      },
    },
  ),
)
