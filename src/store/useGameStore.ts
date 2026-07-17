import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDaysToKey, todayKey } from '@/lib/calendar'
import {
  createGoal,
  recomputeGoalStatuses,
  syncRegionLevels,
  type GoalInput,
} from '@/lib/planning/goalEngine'
import { applyCompletion, createMission, isDoneForNow, type MissionInput } from '@/lib/planning/missionEngine'
import { applyMissionReward } from '@/lib/planning/profileEngine'
import { regionCategory } from '@/data/regionCategories'
import { planById } from '@/data/plans'
import type { LatLng } from '@/lib/world/layout'
import type { ActivityLog, Goal, Mission, PlayerProfile, Region, RegionCategory } from '@/types'

export interface RegionInput {
  name: string
  category: RegionCategory
  description?: string
  lat?: number
  lng?: number
}

interface GameState {
  regions: Region[]
  goals: Goal[]
  missions: Mission[]
  profile: PlayerProfile
  /** Per-day XP/mission totals — the source for the weekly activity strip. */
  activityLog: ActivityLog
  lastGainedXp: number | null
  /** Fixed point the region "world" is laid out around — set once from the first real location fix, so recentering the map (e.g. "Dónde estoy") never reshuffles the regions. */
  worldAnchor: LatLng | null
  setWorldAnchor: (anchor: LatLng) => void

  addRegion: (input: RegionInput) => string
  updateRegion: (regionId: string, input: RegionInput) => void
  deleteRegion: (regionId: string) => void

  addGoal: (input: GoalInput) => string
  updateGoal: (goalId: string, input: GoalInput) => void
  deleteGoal: (goalId: string) => void

  addMission: (input: MissionInput) => string
  updateMission: (missionId: string, input: MissionInput) => void
  deleteMission: (missionId: string) => void
  moveMission: (missionId: string, date: string) => void
  completeMission: (missionId: string) => void

  /** Creates the plan's goal + missions inside a region. Returns the goal id, or null if plan/region don't exist. */
  startPlan: (planId: string, regionId: string) => string | null

  setProfileName: (name: string) => void
  setDailyXpGoal: (xp: number) => void
  startNewProfile: (name: string) => void
  clearLastGainedXp: () => void
  resetToFreshStart: () => void
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

/** Records one completion in the per-day log, pruning entries older than ~6 months. */
function logActivity(log: ActivityLog, today: string, xp: number): ActivityLog {
  const next: ActivityLog = {}
  const cutoff = addDaysToKey(today, -180)
  for (const [day, entry] of Object.entries(log)) {
    if (day >= cutoff) next[day] = entry
  }
  const current = next[today] ?? { xp: 0, missions: 0 }
  next[today] = { xp: current.xp + xp, missions: current.missions + 1 }
  return next
}

function buildRegion(input: RegionInput): Region {
  const cat = regionCategory(input.category)
  return {
    id: `region-${crypto.randomUUID()}`,
    name: input.name,
    category: input.category,
    emoji: cat.icon,
    color: cat.color,
    level: 0,
    description: input.description ?? cat.description,
    goalIds: [],
    lat: input.lat,
    lng: input.lng,
  }
}

/**
 * Brings any persisted shape (local save or cloud row) up to the current model:
 * - Fixed-era regions (no `category`) survive only if they still hold goals,
 *   converted to category 'otro'; empty ones were demo scaffolding and are dropped.
 * - The retired `places` list becomes real regions at their coordinates.
 * - Goals pointing at a dropped region are dropped too (demo content), along
 *   with their missions; derived statuses/levels are recomputed at the end.
 */
export function normalizeGameState(raw: Partial<GameState> & { places?: unknown; inventory?: unknown }): Partial<GameState> {
  const { places: rawPlaces, inventory: _inventory, ...rest } = raw
  const rawRegions = (rest.regions ?? []) as (Region & { category?: RegionCategory })[]
  const goals = rest.goals ?? []
  const missions = rest.missions ?? []

  const migratedRegions: Region[] = rawRegions
    .filter((r) => r.category !== undefined || goals.some((g) => g.regionId === r.id))
    .map((r) =>
      r.category !== undefined
        ? r
        : { ...r, category: 'otro' as const, goalIds: goals.filter((g) => g.regionId === r.id).map((g) => g.id) },
    )

  const legacyPlaces = Array.isArray(rawPlaces)
    ? (rawPlaces as { id: string; name: string; category: string; lat: number; lng: number }[])
    : []
  for (const place of legacyPlaces) {
    const category = (REGION_CATEGORY_IDS.includes(place.category as RegionCategory) ? place.category : 'otro') as RegionCategory
    const cat = regionCategory(category)
    migratedRegions.push({
      id: place.id,
      name: place.name,
      category,
      emoji: cat.icon,
      color: cat.color,
      level: 0,
      description: cat.description,
      goalIds: [],
      lat: place.lat,
      lng: place.lng,
    })
  }

  const regionIds = new Set(migratedRegions.map((r) => r.id))
  const keptGoals = goals.filter((g) => regionIds.has(g.regionId))
  const keptGoalIds = new Set(keptGoals.map((g) => g.id))
  const keptMissions = missions.filter((m) => keptGoalIds.has(m.goalId))

  return {
    ...rest,
    activityLog: rest.activityLog ?? {},
    missions: keptMissions,
    ...deriveAfterMissionChange(keptGoals, keptMissions, migratedRegions),
  }
}

const REGION_CATEGORY_IDS: RegionCategory[] = ['casa', 'trabajo', 'gimnasio', 'universidad', 'banco', 'parque', 'otro']

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      regions: [],
      goals: [],
      missions: [],
      profile: { name: 'Aventurero', ...STARTING_PROFILE },
      activityLog: {},
      lastGainedXp: null,
      worldAnchor: null,

      setWorldAnchor: (anchor) => set((state) => (state.worldAnchor ? {} : { worldAnchor: anchor })),

      addRegion: (input) => {
        const region = buildRegion(input)
        set((state) => ({ regions: [...state.regions, region] }))
        return region.id
      },

      updateRegion: (regionId, input) => {
        set((state) => ({
          regions: state.regions.map((r) => {
            if (r.id !== regionId) return r
            const cat = regionCategory(input.category)
            const changedCategory = input.category !== r.category
            return {
              ...r,
              name: input.name,
              category: input.category,
              description: input.description ?? r.description,
              // Re-skin only when the kind of place changed — otherwise keep the look.
              emoji: changedCategory ? cat.icon : r.emoji,
              color: changedCategory ? cat.color : r.color,
              lat: input.lat ?? r.lat,
              lng: input.lng ?? r.lng,
            }
          }),
        }))
      },

      // Deleting a region takes its goals and missions with it — the callers
      // confirm with the user first.
      deleteRegion: (regionId) => {
        set((state) => {
          const regions = state.regions.filter((r) => r.id !== regionId)
          const removedGoalIds = new Set(state.goals.filter((g) => g.regionId === regionId).map((g) => g.id))
          const goals = state.goals.filter((g) => !removedGoalIds.has(g.id))
          const missions = state.missions.filter((m) => !removedGoalIds.has(m.goalId))
          return { missions, ...deriveAfterMissionChange(goals, missions, regions) }
        })
      },

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
            activityLog: logActivity(state.activityLog, today, mission.xp),
            lastGainedXp: mission.xp,
          }
        })
      },

      startPlan: (planId, regionId) => {
        const plan = planById(planId)
        const region = get().regions.find((r) => r.id === regionId)
        if (!plan || !region) return null

        const start = todayKey()
        const goal: Goal = {
          ...createGoal({
            regionId,
            name: plan.name,
            description: plan.description,
            category: 'Plan exprés',
            startDate: start,
            dueDate: addDaysToKey(start, plan.durationWeeks * 7),
            priority: 'alta',
            xpReward: plan.xpReward,
            reward: plan.reward,
            color: plan.color,
            icon: plan.icon,
          }),
          planId: plan.id,
        }
        const planMissions: Mission[] = plan.missions.map((b) =>
          createMission({
            goalId: goal.id,
            title: b.title,
            description: b.description,
            date: addDaysToKey(start, b.startOffsetDays),
            time: b.time,
            priority: b.priority,
            xp: b.xp,
            coins: b.coins,
            estimatedMinutes: b.estimatedMinutes,
            tags: b.tags,
            repeat: b.repeat,
          }),
        )
        goal.missionIds = planMissions.map((m) => m.id)

        set((state) => {
          const goals = [...state.goals, goal]
          const missions = [...state.missions, ...planMissions]
          return { missions, ...deriveAfterMissionChange(goals, missions, state.regions) }
        })
        return goal.id
      },

      setProfileName: (name) => set((state) => ({ profile: { ...state.profile, name } })),

      setDailyXpGoal: (xp) =>
        set((state) => ({ profile: { ...state.profile, dailyXpGoal: Math.max(10, Math.round(xp)) } })),

      startNewProfile: (name) => set({ profile: { name, ...STARTING_PROFILE } }),

      clearLastGainedXp: () => set({ lastGainedXp: null }),

      // A brand new cloud account should never silently inherit this browser's
      // previous local world — regions are personal places now, so it starts empty.
      resetToFreshStart: () =>
        set({
          regions: [],
          goals: [],
          missions: [],
          profile: { name: 'Aventurero', ...STARTING_PROFILE },
          activityLog: {},
          lastGainedXp: null,
          worldAnchor: null,
        }),
    }),
    {
      name: 'questly-game-state-v2',
      // Saves may predate user-created regions (fixed regions + `places`) or
      // carry stale derived state — normalize brings any old shape up to date.
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as Partial<GameState>
        // Spread over `current` (not `merged`) so retired keys like `places`
        // don't linger in the state and get re-persisted forever.
        return { ...current, ...normalizeGameState({ ...current, ...persistedState }) }
      },
    },
  ),
)
