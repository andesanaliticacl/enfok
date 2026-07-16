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
    mask: 'none',
    shirt: 'tshirt',
    pants: 'default',
    shoes: 'default',
    pet: 'none',
  },
  colors: {
    body: 'light',
    head: 'light',
    eyes: 'brown',
    hair: 'brown',
    mask: 'dark',
    shirt: 'blue',
    pants: 'gray',
    shoes: 'brown',
  },
  pixelOverrides: {},
}

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
            options: { ...current.avatar.options, ...persistedState.avatar?.options },
            colors: { ...current.avatar.colors, ...persistedState.avatar?.colors },
            pixelOverrides: { ...current.avatar.pixelOverrides, ...persistedState.avatar?.pixelOverrides },
          },
        }
      },
    },
  ),
)
