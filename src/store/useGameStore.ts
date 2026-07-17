import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  goals as mockGoals,
  inventory as mockInventory,
  missions as mockMissions,
  playerProfile as mockProfile,
  regions as mockRegions,
} from '@/data/mockData'
import { todayKey } from '@/lib/calendar'
import {
  createGoal,
  recomputeGoalStatuses,
  syncRegionLevels,
  type GoalInput,
} from '@/lib/planning/goalEngine'
import { applyCompletion, createMission, isDoneForNow, type MissionInput } from '@/lib/planning/missionEngine'
import { applyMissionReward } from '@/lib/planning/profileEngine'
import type { LatLng } from '@/lib/world/layout'
import type { Goal, InventoryItem, Mission, Place, PlaceCategory, PlayerProfile, Region } from '@/types'

interface GameState {
  regions: Region[]
  goals: Goal[]
  missions: Mission[]
  inventory: InventoryItem[]
  places: Place[]
  profile: PlayerProfile
  lastGainedXp: number | null
  /** Fixed point the region "world" is laid out around — set once from the first real location fix, so recentering the map (e.g. "Dónde estoy") never reshuffles the regions. */
  worldAnchor: LatLng | null
  setWorldAnchor: (anchor: LatLng) => void

  addGoal: (input: GoalInput) => string
  updateGoal: (goalId: string, input: GoalInput) => void
  deleteGoal: (goalId: string) => void

  addMission: (input: MissionInput) => string
  updateMission: (missionId: string, input: MissionInput) => void
  deleteMission: (missionId: string) => void
  moveMission: (missionId: string, date: string) => void
  completeMission: (missionId: string) => void

  setProfileName: (name: string) => void
  setDailyXpGoal: (xp: number) => void
  startNewProfile: (name: string) => void
  clearLastGainedXp: () => void
  resetToFreshStart: () => void

  addPlace: (name: string, category: PlaceCategory, lat: number, lng: number) => void
  deletePlace: (placeId: string) => void
}

const STARTING_PROFILE: Omit<PlayerProfile, 'name'> = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  streakDays: 0,
  hoursInvested: 0,
}

/** Goal statuses and region levels are always derived from missions — recompute after any change that touches them. */
function deriveAfterMissionChange(goals: GameState['goals'], missions: GameState['missions'], regions: GameState['regions']) {
  const nextGoals = recomputeGoalStatuses(goals, missions)
  return { goals: nextGoals, regions: syncRegionLevels(regions, nextGoals) }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      regions: mockRegions,
      goals: mockGoals,
      missions: mockMissions,
      inventory: mockInventory,
      places: [],
      profile: mockProfile,
      lastGainedXp: null,
      worldAnchor: null,

      setWorldAnchor: (anchor) => set((state) => (state.worldAnchor ? {} : { worldAnchor: anchor })),

      addGoal: (input) => {
        const goal = createGoal(input)
        set((state) => {
          const goals = [...state.goals, goal]
          const regions = state.regions.map((r) =>
            r.id === goal.regionId ? { ...r, goalIds: [...r.goalIds, goal.id] } : r,
          )
          return { goals, regions: syncRegionLevels(regions, goals) }
        })
        return goal.id
      },

      updateGoal: (goalId, input) => {
        set((state) => {
          const goals = state.goals.map((g) => (g.id === goalId ? { ...g, ...input } : g))
          // If the goal moved to another region, its id has to move between the
          // regions' goalIds too — otherwise the old region keeps a ghost entry.
          const regions = state.regions.map((r) => {
            const listed = r.goalIds.includes(goalId)
            if (r.id === input.regionId) return listed ? r : { ...r, goalIds: [...r.goalIds, goalId] }
            return listed ? { ...r, goalIds: r.goalIds.filter((id) => id !== goalId) } : r
          })
          return deriveAfterMissionChange(goals, state.missions, regions)
        })
      },

      deleteGoal: (goalId) => {
        set((state) => {
          const goals = state.goals.filter((g) => g.id !== goalId)
          const missions = state.missions.filter((m) => m.goalId !== goalId)
          const regions = state.regions.map((r) => ({ ...r, goalIds: r.goalIds.filter((id) => id !== goalId) }))
          return { missions, ...deriveAfterMissionChange(goals, missions, regions) }
        })
      },

      addMission: (input) => {
        const mission = createMission(input)
        set((state) => {
          const missions = [...state.missions, mission]
          const goals = state.goals.map((g) =>
            g.id === mission.goalId ? { ...g, missionIds: [...g.missionIds, mission.id] } : g,
          )
          // Adding a mission to a finished goal reopens it.
          return { missions, ...deriveAfterMissionChange(goals, missions, state.regions) }
        })
        return mission.id
      },

      updateMission: (missionId, input) => {
        set((state) => {
          const missions = state.missions.map((m) => (m.id === missionId ? { ...m, ...input } : m))
          return { missions, ...deriveAfterMissionChange(state.goals, missions, state.regions) }
        })
      },

      deleteMission: (missionId) => {
        set((state) => {
          const missions = state.missions.filter((m) => m.id !== missionId)
          const goals = state.goals.map((g) => ({ ...g, missionIds: g.missionIds.filter((id) => id !== missionId) }))
          // Deleting the last pending mission can complete its goal.
          return { missions, ...deriveAfterMissionChange(goals, missions, state.regions) }
        })
      },

      moveMission: (missionId, date) => {
        set((state) => ({
          missions: state.missions.map((m) => (m.id === missionId ? { ...m, date } : m)),
        }))
      },

      completeMission: (missionId) => {
        const today = todayKey()
        const mission = get().missions.find((m) => m.id === missionId)
        // isDoneForNow also blocks re-completing a repeating mission whose next
        // occurrence is in the future — no double XP for the same cycle.
        if (!mission || isDoneForNow(mission, today)) return

        set((state) => {
          const missions = state.missions.map((m) => (m.id === missionId ? applyCompletion(m, today) : m))
          return {
            missions,
            ...deriveAfterMissionChange(state.goals, missions, state.regions),
            profile: applyMissionReward(state.profile, mission, today),
            lastGainedXp: mission.xp,
          }
        })
      },

      setProfileName: (name) => set((state) => ({ profile: { ...state.profile, name } })),

      setDailyXpGoal: (xp) =>
        set((state) => ({ profile: { ...state.profile, dailyXpGoal: Math.max(10, Math.round(xp)) } })),

      startNewProfile: (name) => set({ profile: { name, ...STARTING_PROFILE } }),

      clearLastGainedXp: () => set({ lastGainedXp: null }),

      // The initial regions/goals/missions/inventory above are demo content
      // for local, account-less exploration — a brand new cloud account
      // should never silently inherit someone else's example goals.
      resetToFreshStart: () =>
        set({
          regions: mockRegions.map((r) => ({ ...r, level: 0, goalIds: [] })),
          goals: [],
          missions: [],
          inventory: [],
          places: [],
          profile: { name: 'Aventurero', ...STARTING_PROFILE },
          lastGainedXp: null,
          worldAnchor: null,
        }),

      addPlace: (name, category, lat, lng) =>
        set((state) => ({
          places: [...state.places, { id: `place-${crypto.randomUUID()}`, name, category, lat, lng }],
        })),

      deletePlace: (placeId) =>
        set((state) => ({ places: state.places.filter((p) => p.id !== placeId) })),
    }),
    {
      name: 'questly-game-state-v2',
      // Backfill `places` for saves made before this field existed, same
      // reasoning as the avatar store's merge fix — a missing array here
      // would crash WorldMap on first render instead of just being empty.
      // Goal statuses and region levels are derived state, so recompute them
      // on load: saves from before they were derived carry stale values.
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<GameState>
        const merged = { ...current, ...persistedState, places: persistedState.places ?? current.places }
        return { ...merged, ...deriveAfterMissionChange(merged.goals, merged.missions, merged.regions) }
      },
    },
  ),
)
