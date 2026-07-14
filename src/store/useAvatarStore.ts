import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import type { AvatarConfig } from '@/lib/avatar/types'
import type { BiomeId } from '@/types'

const DEFAULT_AVATAR: AvatarConfig = {
  figure: 'male',
  options: {
    body: 'male',
    eyes: 'default',
    hair: 'plain',
    mask: 'none',
    shirt: 'tshirt',
    pants: 'default',
    shoes: 'default',
  },
  colors: {
    body: 'light',
    eyes: 'brown',
    hair: 'brown',
    mask: 'dark',
    shirt: 'blue',
    pants: 'gray',
    shoes: 'brown',
  },
}

interface AvatarState {
  hasCreatedCharacter: boolean
  avatar: AvatarConfig
  biome: BiomeId | null
  setFigure: (figure: AvatarConfig['figure']) => void
  setOption: (category: keyof AvatarConfig['options'], optionId: string) => void
  setColor: (category: keyof AvatarConfig['colors'], colorId: string) => void
  setBiome: (biome: BiomeId) => void
  finishCreation: () => void
  deleteCharacter: () => void
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      hasCreatedCharacter: false,
      avatar: DEFAULT_AVATAR,
      biome: null,

      setFigure: (figure) =>
        set((state) => {
          const options: AvatarConfig['options'] = { ...state.avatar.options, body: figure }

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
        set((state) => ({
          avatar: { ...state.avatar, options: { ...state.avatar.options, [category]: optionId } },
        })),

      setColor: (category, colorId) =>
        set((state) => ({
          avatar: { ...state.avatar, colors: { ...state.avatar.colors, [category]: colorId } },
        })),

      setBiome: (biome) => set({ biome }),

      finishCreation: () => set({ hasCreatedCharacter: true }),

      deleteCharacter: () => set({ hasCreatedCharacter: false, avatar: DEFAULT_AVATAR, biome: null }),
    }),
    { name: 'questly-avatar-state' },
  ),
)
