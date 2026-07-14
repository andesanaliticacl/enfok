import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  goals as mockGoals,
  inventory as mockInventory,
  missions as mockMissions,
  playerProfile as mockProfile,
  regions as mockRegions,
} from '@/data/mockData'
import { createGoal, isGoalComplete, type GoalInput } from '@/lib/planning/goalEngine'
import { applyCompletion, createMission, type MissionInput } from '@/lib/planning/missionEngine'
import type { Goal, InventoryItem, Mission, PlayerProfile, Region } from '@/types'

interface GameState {
  regions: Region[]
  goals: Goal[]
  missions: Mission[]
  inventory: InventoryItem[]
  profile: PlayerProfile
  lastGainedXp: number | null

  addGoal: (input: GoalInput) => string
  updateGoal: (goalId: string, input: GoalInput) => void
  deleteGoal: (goalId: string) => void

  addMission: (input: MissionInput) => string
  updateMission: (missionId: string, input: MissionInput) => void
  deleteMission: (missionId: string) => void
  moveMission: (missionId: string, date: string) => void
  completeMission: (missionId: string) => void

  setProfileName: (name: string) => void
  startNewProfile: (name: string) => void
  clearLastGainedXp: () => void
}

const STARTING_PROFILE: Omit<PlayerProfile, 'name'> = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  streakDays: 0,
  hoursInvested: 0,
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
      goals: mockGoals,
      missions: mockMissions,
      inventory: mockInventory,
      profile: mockProfile,
      lastGainedXp: null,

      addGoal: (input) => {
        const goal = createGoal(input)
        set((state) => ({
          goals: [...state.goals, goal],
          regions: state.regions.map((r) =>
            r.id === goal.regionId ? { ...r, goalIds: [...r.goalIds, goal.id] } : r,
          ),
        }))
        return goal.id
      },

      updateGoal: (goalId, input) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...input } : g)),
        }))
      },

      deleteGoal: (goalId) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
          missions: state.missions.filter((m) => m.goalId !== goalId),
          regions: state.regions.map((r) => ({ ...r, goalIds: r.goalIds.filter((id) => id !== goalId) })),
        }))
      },

      addMission: (input) => {
        const mission = createMission(input)
        set((state) => ({
          missions: [...state.missions, mission],
          goals: state.goals.map((g) =>
            g.id === mission.goalId ? { ...g, missionIds: [...g.missionIds, mission.id] } : g,
          ),
        }))
        return mission.id
      },

      updateMission: (missionId, input) => {
        set((state) => ({
          missions: state.missions.map((m) => (m.id === missionId ? { ...m, ...input } : m)),
        }))
      },

      deleteMission: (missionId) => {
        set((state) => ({
          missions: state.missions.filter((m) => m.id !== missionId),
          goals: state.goals.map((g) => ({ ...g, missionIds: g.missionIds.filter((id) => id !== missionId) })),
        }))
      },

      moveMission: (missionId, date) => {
        set((state) => ({
          missions: state.missions.map((m) => (m.id === missionId ? { ...m, date } : m)),
        }))
      },

      completeMission: (missionId) => {
        const mission = get().missions.find((m) => m.id === missionId)
        if (!mission || mission.status === 'completada') return

        set((state) => {
          const updatedMissions = state.missions.map((m) => (m.id === missionId ? applyCompletion(m) : m))
          const goal = state.goals.find((g) => g.id === mission.goalId)
          const goals =
            goal && goal.status !== 'completado' && isGoalComplete(goal, updatedMissions)
              ? state.goals.map((g) => (g.id === goal.id ? { ...g, status: 'completado' as const } : g))
              : state.goals

          return {
            missions: updatedMissions,
            goals,
            profile: applyLevelUp({
              ...state.profile,
              xp: state.profile.xp + mission.xp,
              coins: state.profile.coins + mission.coins,
            }),
            lastGainedXp: mission.xp,
          }
        })
      },

      setProfileName: (name) => set((state) => ({ profile: { ...state.profile, name } })),

      startNewProfile: (name) => set({ profile: { name, ...STARTING_PROFILE } }),

      clearLastGainedXp: () => set({ lastGainedXp: null }),
    }),
    { name: 'questly-game-state-v2' },
  ),
)
