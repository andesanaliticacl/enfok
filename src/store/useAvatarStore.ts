import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AvatarConfig } from '@/lib/avatar/types'
import type { BiomeId } from '@/types'

const DEFAULT_AVATAR: AvatarConfig = {
  figure: 'male',
  options: {
    body: 'male',
    eyes: 'default',
    hair: 'plain',
    shirt: 'default',
    pants: 'default',
    shoes: 'default',
  },
  colors: {
    body: 'light',
    eyes: 'brown',
    hair: 'brown',
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
  resetCharacter: () => void
}

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      hasCreatedCharacter: false,
      avatar: DEFAULT_AVATAR,
      biome: null,

      setFigure: (figure) =>
        set((state) => ({
          avatar: {
            ...state.avatar,
            figure,
            options: { ...state.avatar.options, body: figure },
          },
        })),

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

      resetCharacter: () => set({ hasCreatedCharacter: false, avatar: DEFAULT_AVATAR, biome: null }),
    }),
    { name: 'questly-avatar-state' },
  ),
)
