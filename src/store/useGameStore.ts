import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  inventory as mockInventory,
  missions as mockMissions,
  objectives as mockObjectives,
  playerProfile as mockProfile,
  regions as mockRegions,
} from '@/data/mockData'
import type { InventoryItem, Mission, Objective, PlayerProfile, Region } from '@/types'

interface GameState {
  regions: Region[]
  objectives: Objective[]
  missions: Mission[]
  inventory: InventoryItem[]
  profile: PlayerProfile
  lastGainedXp: number | null
  completeMission: (missionId: string) => void
  clearLastGainedXp: () => void
}

function applyLevelUp(profile: PlayerProfile): PlayerProfile {
  let { level, xp, xpToNextLevel } = profile
  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel
    level += 1
    xpToNextLevel = Math.round(xpToNextLevel * 1.15)
  }
  return { ...profile, level, xp, xpToNextLevel }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      regions: mockRegions,
      objectives: mockObjectives,
      missions: mockMissions,
      inventory: mockInventory,
      profile: mockProfile,
      lastGainedXp: null,

      completeMission: (missionId) => {
        const mission = get().missions.find((m) => m.id === missionId)
        if (!mission || mission.status === 'completada') return

        set((state) => ({
          missions: state.missions.map((m) =>
            m.id === missionId
              ? { ...m, status: 'completada', completedAt: new Date().toISOString() }
              : m,
          ),
          profile: applyLevelUp({
            ...state.profile,
            xp: state.profile.xp + mission.xp,
            coins: state.profile.coins + mission.coins,
          }),
          lastGainedXp: mission.xp,
        }))
      },

      clearLastGainedXp: () => set({ lastGainedXp: null }),
    }),
    { name: 'questly-game-state' },
  ),
)
