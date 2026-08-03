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
import { applyMissionReward, grantXp, playerStats } from '@/lib/planning/profileEngine'
import { MOOD_CHECKIN_HEART } from '@/data/moods'
import { CORE_MODULE_IDS } from '@/data/inventoryModules'
import { GROCERY_EXPENSE_DESCRIPTION, checkedGroceryTotal } from '@/lib/planning/groceryEngine'
import { DEFAULT_USD_TO_CLP } from '@/lib/planning/currency'
import { regionCategory } from '@/data/regionCategories'
import { statForRegionCategory, EMPTY_PLAYER_STATS } from '@/data/playerStats'
import { planById } from '@/data/plans'
import type { LatLng } from '@/lib/world/layout'
import type {
  ActivityLog,
  Currency,
  ExerciseItem,
  FinanceEntry,
  FinanceEntryType,
  FixedExpense,
  Goal,
  GroceryCategory,
  GroceryItem,
  IncomeSource,
  Mission,
  MuscleGroup,
  Weekday,
  PlayerProfile,
  Region,
  RegionCategory,
  InventoryModuleId,
  MoodKey,
  MoodEntry,
  JournalNote,
  LifeSystem,
  Person,
  SystemStep,
} from '@/types'

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

  financeEntries: FinanceEntry[]
  incomeSources: IncomeSource[]
  fixedExpenses: FixedExpense[]
  /** How many CLP one USD is worth — editable, used to show one CLP-equivalent total across currencies. */
  usdToClp: number
  setUsdToClp: (rate: number) => void
  groceryItems: GroceryItem[]
  /** Finanzas entry the current basket is linked to — set on first send, so later sends update it instead of adding another expense. */
  groceryPurchaseEntryId: string | null
  exerciseItems: ExerciseItem[]

  /** Shop item ids the player owns (titles, auras, sticker packs). */
  unlocks: string[]
  /** Shop item id of the title shown under the player's name, if any. */
  equippedTitle: string | null
  /** Shop item id of the aura rendered around the avatar, if any. */
  equippedAura: string | null
  /** Achievement ids whose one-time coin reward was already collected. */
  claimedAchievements: string[]
  /** ISO date (yyyy-mm-dd) the daily verse was last read — gates the once-a-day XP. */
  lastVerseDate: string | null

  /** Deducts the price and stores the unlock. Returns false (and changes nothing) if coins are short or it's already owned. */
  purchaseShopItem: (itemId: string, price: number) => boolean
  equipTitle: (itemId: string | null) => void
  equipAura: (itemId: string | null) => void
  /** Pays out an unlocked achievement's coins, once. */
  claimAchievementReward: (achievementId: string, coins: number) => void
  /** Grants the daily verse's XP, once per day. No-op if already read today. */
  claimDailyVerse: (xp: number) => void

  addFinanceEntry: (input: { type: FinanceEntryType; amount: number; currency: Currency; description: string; date: string }) => void
  updateFinanceEntry: (
    entryId: string,
    input: { type: FinanceEntryType; amount: number; currency: Currency; description: string; date: string },
  ) => void
  deleteFinanceEntry: (entryId: string) => void

  addIncomeSource: (input: { name: string; amount: number; currency: Currency }) => void
  updateIncomeSource: (sourceId: string, input: { name: string; amount: number; currency: Currency }) => void
  deleteIncomeSource: (sourceId: string) => void

  addFixedExpense: (input: { name: string; amount: number; currency: Currency }) => void
  updateFixedExpense: (expenseId: string, input: { name: string; amount: number; currency: Currency }) => void
  deleteFixedExpense: (expenseId: string) => void

  addGroceryItem: (input: { name: string; quantity: number; category: GroceryCategory; price?: number }) => void
  updateGroceryItem: (
    itemId: string,
    input: { name: string; quantity: number; category: GroceryCategory; price?: number },
  ) => void
  toggleGroceryItem: (itemId: string) => void
  deleteGroceryItem: (itemId: string) => void
  /**
   * Sends the checked basket to Finanzas as ONE expense. Called again after
   * editing the basket, it updates that same entry instead of duplicating it —
   * so a sent basket stays editable. Returns the charged amount (0 if nothing).
   */
  logGroceryPurchase: () => number
  /** Closes the current basket: unchecks everything and unlinks it from its Finanzas entry, ready for next month. */
  resetGroceryBasket: () => void

  addExerciseItem: (input: { name: string; muscleGroup: MuscleGroup; trainingDays: Weekday[] }) => void
  updateExerciseItem: (
    itemId: string,
    input: { name: string; muscleGroup: MuscleGroup; trainingDays: Weekday[] },
  ) => void
  deleteExerciseItem: (itemId: string) => void
  logExerciseSet: (itemId: string, input: { weight: number; reps: number; date: string }) => void
  deleteExerciseLog: (itemId: string, logId: string) => void

  /** Custom label per weekday's training split slot — "Grupo 3" becomes "Pecho" once renamed. */
  trainingDayNames: Partial<Record<Weekday, string>>
  setTrainingDayName: (day: Weekday, name: string) => void

  /** Inventory modules switched on. Finanzas is core and always present. */
  enabledModules: InventoryModuleId[]
  enableModule: (id: InventoryModuleId) => void
  disableModule: (id: InventoryModuleId) => void

  /** One emotional check-in per day — feeds Corazón and the bitácora. */
  moodLog: MoodEntry[]
  /** Records today's mood (+1 Corazón). No-op if today is already logged. */
  logMood: (mood: MoodKey, note?: string) => void

  journalNotes: JournalNote[]
  addJournalNote: (text: string) => void
  deleteJournalNote: (noteId: string) => void

  systems: LifeSystem[]
  addSystem: (input: { name: string; icon: string; color: string; steps: string[]; loops: boolean }) => string
  updateSystem: (systemId: string, input: { name: string; icon: string; color: string; loops: boolean }) => void
  deleteSystem: (systemId: string) => void
  addSystemStep: (systemId: string, label: string) => void
  updateSystemStep: (
    systemId: string,
    stepId: string,
    input: { label: string; note?: string; personId?: string; role?: string },
  ) => void

  /** Tu equipo: quiénes son y qué roles cumplen. Compartido por todos los sistemas. */
  people: Person[]
  /** Crea la persona y devuelve su id — usable al vuelo desde un bloque. */
  addPerson: (input: { name: string; roles: string[] }) => string
  updatePerson: (personId: string, input: { name: string; roles: string[] }) => void
  /** La borra del equipo y la desasigna de cualquier paso que la tuviera. */
  deletePerson: (personId: string) => void
  deleteSystemStep: (systemId: string, stepId: string) => void
  /** Moves a step one slot up (-1) or down (+1) in the chain. */
  moveSystemStep: (systemId: string, stepId: string, direction: -1 | 1) => void

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
  /** Replaces everything with a previously exported backup, run through the same migrations as a normal load. */
  importSnapshot: (data: Record<string, unknown>) => void
}

const STARTING_PROFILE: Omit<PlayerProfile, 'name'> = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 0,
  streakDays: 0,
  hoursInvested: 0,
  stats: { ...EMPTY_PLAYER_STATS },
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
    unlocks: rest.unlocks ?? [],
    equippedTitle: rest.equippedTitle ?? null,
    equippedAura: rest.equippedAura ?? null,
    claimedAchievements: rest.claimedAchievements ?? [],
    lastVerseDate: rest.lastVerseDate ?? null,
    usdToClp: rest.usdToClp ?? DEFAULT_USD_TO_CLP,
    trainingDayNames: rest.trainingDayNames ?? {},
    moodLog: rest.moodLog ?? [],
    journalNotes: rest.journalNotes ?? [],
    ...migratePeopleAndSystems(rest.people, rest.systems),
    // Saves from before modules existed had every section always visible, so a
    // section holding real data must come back switched ON — otherwise upgrading
    // would look like the data vanished.
    enabledModules:
      rest.enabledModules ??
      ([
        ...CORE_MODULE_IDS,
        ...((rest.groceryItems ?? []).length > 0 ? (['compras'] as const) : []),
        ...((rest.exerciseItems ?? []).length > 0 ? (['ejercicios'] as const) : []),
      ] as InventoryModuleId[]),
    profile: rest.profile ? { ...rest.profile, stats: { ...EMPTY_PLAYER_STATS, ...rest.profile.stats } } : rest.profile,
    // Money entries/sources predating currencies default to CLP.
    financeEntries: ((rest.financeEntries ?? []) as (FinanceEntry & { currency?: Currency })[]).map((e) => ({
      ...e,
      currency: e.currency ?? 'CLP',
    })),
    incomeSources: ((rest.incomeSources ?? []) as (IncomeSource & { currency?: Currency })[]).map((s) => ({
      ...s,
      currency: s.currency ?? 'CLP',
    })),
    fixedExpenses: ((rest.fixedExpenses ?? []) as (FixedExpense & { currency?: Currency })[]).map((e) => ({
      ...e,
      currency: e.currency ?? 'CLP',
    })),
    // Grocery items predating categories default to 'otros'. Quantity used to be
    // free text ("2L", "3 cajas") — keep the leading number so totals still work,
    // falling back to a single unit when there isn't one.
    groceryItems: (
      (rest.groceryItems ?? []) as (Omit<GroceryItem, 'quantity'> & {
        category?: GroceryCategory
        quantity?: number | string
      })[]
    ).map((i) => ({
      ...i,
      category: i.category ?? 'otros',
      quantity: Math.max(1, Math.round(Number.parseFloat(String(i.quantity ?? 1)) || 1)),
    })),
    groceryPurchaseEntryId: rest.groceryPurchaseEntryId ?? null,
    // Exercises predating muscle groups/logs/training days (the old free-text "sets" + done checkbox)
    // migrate to the body-map model with no history — there was no weight/reps data to carry over.
    exerciseItems: (
      (rest.exerciseItems ?? []) as (ExerciseItem & { muscleGroup?: MuscleGroup; trainingDays?: Weekday[]; logs?: unknown })[]
    ).map((i) => ({
      id: i.id,
      name: i.name,
      muscleGroup: i.muscleGroup ?? 'otros',
      trainingDays: Array.isArray(i.trainingDays) ? i.trainingDays : [],
      logs: Array.isArray(i.logs) ? i.logs : [],
    })),
    missions: keptMissions,
    ...deriveAfterMissionChange(keptGoals, keptMissions, migratedRegions),
  }
}

const REGION_CATEGORY_IDS: RegionCategory[] = ['casa', 'trabajo', 'gimnasio', 'universidad', 'banco', 'parque', 'otro']

/**
 * Owners used to be free text on each step. They're a real roster now, so any
 * legacy `owner` string becomes a Person (deduped by name, collecting every role
 * they were given across steps) and the step points at them instead.
 */
function migratePeopleAndSystems(
  rawPeople: Person[] | undefined,
  rawSystems: LifeSystem[] | undefined,
): { people: Person[]; systems: LifeSystem[] } {
  const people: Person[] = rawPeople ? [...rawPeople] : []
  const byName = new Map(people.map((p) => [p.name.toLowerCase(), p]))

  const systems = (rawSystems ?? []).map((system) => ({
    ...system,
    steps: system.steps.map((step) => {
      const legacy = step as SystemStep & { owner?: string }
      if (!legacy.owner?.trim() || legacy.personId) {
        const { owner: _dropped, ...clean } = legacy
        return clean
      }

      const name = legacy.owner.trim()
      let person = byName.get(name.toLowerCase())
      if (!person) {
        person = { id: `person-${crypto.randomUUID()}`, name, roles: [] }
        people.push(person)
        byName.set(name.toLowerCase(), person)
      }
      if (legacy.role?.trim() && !person.roles.includes(legacy.role.trim())) {
        person.roles.push(legacy.role.trim())
      }

      const { owner: _dropped, ...clean } = legacy
      return { ...clean, personId: person.id }
    }),
  }))

  return { people, systems }
}

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
      financeEntries: [],
      incomeSources: [],
      fixedExpenses: [],
      usdToClp: DEFAULT_USD_TO_CLP,
      groceryItems: [],
      groceryPurchaseEntryId: null,
      exerciseItems: [],
      trainingDayNames: {},
      unlocks: [],
      equippedTitle: null,
      equippedAura: null,
      claimedAchievements: [],
      lastVerseDate: null,
      enabledModules: [...CORE_MODULE_IDS],
      moodLog: [],
      journalNotes: [],
      systems: [],
      people: [],

      setWorldAnchor: (anchor) => set((state) => (state.worldAnchor ? {} : { worldAnchor: anchor })),

      enableModule: (id) =>
        set((state) => (state.enabledModules.includes(id) ? {} : { enabledModules: [...state.enabledModules, id] })),

      // Switching a module off only hides its tab — its data stays untouched, so
      // turning it back on restores everything exactly as it was.
      disableModule: (id) =>
        set((state) =>
          CORE_MODULE_IDS.includes(id) ? {} : { enabledModules: state.enabledModules.filter((m) => m !== id) },
        ),

      logMood: (mood, note) => {
        const today = todayKey()
        if (get().moodLog.some((m) => m.date === today)) return
        set((state) => {
          const stats = playerStats(state.profile)
          stats.corazon += MOOD_CHECKIN_HEART
          return {
            moodLog: [{ id: `mood-${crypto.randomUUID()}`, date: today, mood, note }, ...state.moodLog],
            profile: { ...state.profile, stats },
          }
        })
      },

      addJournalNote: (text) =>
        set((state) => ({
          journalNotes: [
            { id: `note-${crypto.randomUUID()}`, date: todayKey(), text },
            ...state.journalNotes,
          ],
        })),

      deleteJournalNote: (noteId) =>
        set((state) => ({ journalNotes: state.journalNotes.filter((n) => n.id !== noteId) })),

      addSystem: (input) => {
        const system: LifeSystem = {
          id: `system-${crypto.randomUUID()}`,
          name: input.name,
          icon: input.icon,
          color: input.color,
          loops: input.loops,
          steps: input.steps.map((label) => ({ id: `step-${crypto.randomUUID()}`, label })),
        }
        set((state) => ({ systems: [...state.systems, system] }))
        return system.id
      },

      updateSystem: (systemId, input) =>
        set((state) => ({
          systems: state.systems.map((s) => (s.id === systemId ? { ...s, ...input } : s)),
        })),

      deleteSystem: (systemId) => set((state) => ({ systems: state.systems.filter((s) => s.id !== systemId) })),

      addSystemStep: (systemId, label) =>
        set((state) => ({
          systems: state.systems.map((s) =>
            s.id === systemId ? { ...s, steps: [...s.steps, { id: `step-${crypto.randomUUID()}`, label }] } : s,
          ),
        })),

      updateSystemStep: (systemId, stepId, input) =>
        set((state) => ({
          systems: state.systems.map((s) =>
            s.id === systemId
              ? { ...s, steps: s.steps.map((step) => (step.id === stepId ? { ...step, ...input } : step)) }
              : s,
          ),
        })),

      deleteSystemStep: (systemId, stepId) =>
        set((state) => ({
          systems: state.systems.map((s) =>
            s.id === systemId ? { ...s, steps: s.steps.filter((step) => step.id !== stepId) } : s,
          ),
        })),

      addPerson: (input) => {
        const person: Person = {
          id: `person-${crypto.randomUUID()}`,
          name: input.name,
          roles: input.roles,
        }
        set((state) => ({ people: [...state.people, person] }))
        return person.id
      },

      updatePerson: (personId, input) =>
        set((state) => ({
          people: state.people.map((p) => (p.id === personId ? { ...p, ...input } : p)),
        })),

      // Removing someone must not leave steps pointing at a ghost, so every
      // assignment to them is cleared in the same update.
      deletePerson: (personId) =>
        set((state) => ({
          people: state.people.filter((p) => p.id !== personId),
          systems: state.systems.map((s) => ({
            ...s,
            steps: s.steps.map((step) =>
              step.personId === personId ? { ...step, personId: undefined, role: undefined } : step,
            ),
          })),
        })),

      moveSystemStep: (systemId, stepId, direction) =>
        set((state) => ({
          systems: state.systems.map((s) => {
            if (s.id !== systemId) return s
            const index = s.steps.findIndex((step) => step.id === stepId)
            const target = index + direction
            if (index === -1 || target < 0 || target >= s.steps.length) return s
            const steps = [...s.steps]
            ;[steps[index], steps[target]] = [steps[target], steps[index]]
            return { ...s, steps }
          }),
        })),

      setUsdToClp: (rate) => set({ usdToClp: rate > 0 ? rate : DEFAULT_USD_TO_CLP }),

      setTrainingDayName: (day, name) =>
        set((state) => ({ trainingDayNames: { ...state.trainingDayNames, [day]: name } })),

      purchaseShopItem: (itemId, price) => {
        const { profile, unlocks } = get()
        if (unlocks.includes(itemId) || profile.coins < price) return false
        set((state) => ({
          unlocks: [...state.unlocks, itemId],
          profile: { ...state.profile, coins: state.profile.coins - price },
        }))
        return true
      },

      equipTitle: (itemId) =>
        set((state) => (itemId === null || state.unlocks.includes(itemId) ? { equippedTitle: itemId } : {})),

      equipAura: (itemId) =>
        set((state) => (itemId === null || state.unlocks.includes(itemId) ? { equippedAura: itemId } : {})),

      claimAchievementReward: (achievementId, coins) =>
        set((state) => {
          if (state.claimedAchievements.includes(achievementId)) return {}
          return {
            claimedAchievements: [...state.claimedAchievements, achievementId],
            profile: { ...state.profile, coins: state.profile.coins + coins },
          }
        }),

      claimDailyVerse: (xp) =>
        set((state) => {
          const today = todayKey()
          if (state.lastVerseDate === today) return {}
          return {
            lastVerseDate: today,
            profile: grantXp(state.profile, xp, today),
            activityLog: logActivity(state.activityLog, today, xp),
            lastGainedXp: xp,
          }
        }),

      addFinanceEntry: (input) =>
        set((state) => ({
          financeEntries: [
            { id: `finance-${crypto.randomUUID()}`, ...input },
            ...state.financeEntries,
          ],
        })),

      updateFinanceEntry: (entryId, input) =>
        set((state) => ({
          financeEntries: state.financeEntries.map((e) => (e.id === entryId ? { ...e, ...input } : e)),
        })),

      deleteFinanceEntry: (entryId) =>
        set((state) => ({ financeEntries: state.financeEntries.filter((e) => e.id !== entryId) })),

      addIncomeSource: (input) =>
        set((state) => ({
          incomeSources: [...state.incomeSources, { id: `income-${crypto.randomUUID()}`, ...input }],
        })),

      updateIncomeSource: (sourceId, input) =>
        set((state) => ({
          incomeSources: state.incomeSources.map((s) => (s.id === sourceId ? { ...s, ...input } : s)),
        })),

      deleteIncomeSource: (sourceId) =>
        set((state) => ({ incomeSources: state.incomeSources.filter((s) => s.id !== sourceId) })),

      addFixedExpense: (input) =>
        set((state) => ({
          fixedExpenses: [...state.fixedExpenses, { id: `expense-${crypto.randomUUID()}`, ...input }],
        })),

      updateFixedExpense: (expenseId, input) =>
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((e) => (e.id === expenseId ? { ...e, ...input } : e)),
        })),

      deleteFixedExpense: (expenseId) =>
        set((state) => ({ fixedExpenses: state.fixedExpenses.filter((e) => e.id !== expenseId) })),

      addGroceryItem: (input) =>
        set((state) => ({
          groceryItems: [
            ...state.groceryItems,
            { id: `grocery-${crypto.randomUUID()}`, checked: false, ...input },
          ],
        })),

      updateGroceryItem: (itemId, input) =>
        set((state) => ({
          groceryItems: state.groceryItems.map((i) => (i.id === itemId ? { ...i, ...input } : i)),
        })),

      toggleGroceryItem: (itemId) =>
        set((state) => ({
          groceryItems: state.groceryItems.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
        })),

      deleteGroceryItem: (itemId) =>
        set((state) => ({ groceryItems: state.groceryItems.filter((i) => i.id !== itemId) })),

      logGroceryPurchase: () => {
        const { groceryItems, groceryPurchaseEntryId, financeEntries } = get()
        const total = checkedGroceryTotal(groceryItems)
        if (total <= 0) return 0

        // The linked entry can be gone if it was deleted straight from Finanzas —
        // then this send starts a fresh one rather than silently doing nothing.
        const linked = groceryPurchaseEntryId
          ? financeEntries.find((e) => e.id === groceryPurchaseEntryId)
          : undefined

        if (linked) {
          set((state) => ({
            financeEntries: state.financeEntries.map((e) =>
              e.id === linked.id ? { ...e, amount: total, date: todayKey() } : e,
            ),
          }))
        } else {
          const entryId = `finance-${crypto.randomUUID()}`
          set((state) => ({
            financeEntries: [
              {
                id: entryId,
                type: 'gasto',
                amount: total,
                currency: 'CLP',
                description: GROCERY_EXPENSE_DESCRIPTION,
                date: todayKey(),
              },
              ...state.financeEntries,
            ],
            groceryPurchaseEntryId: entryId,
          }))
        }
        return total
      },

      resetGroceryBasket: () =>
        set((state) => ({
          groceryItems: state.groceryItems.map((i) => ({ ...i, checked: false })),
          groceryPurchaseEntryId: null,
        })),

      addExerciseItem: (input) =>
        set((state) => ({
          exerciseItems: [...state.exerciseItems, { id: `exercise-${crypto.randomUUID()}`, logs: [], ...input }],
        })),

      updateExerciseItem: (itemId, input) =>
        set((state) => ({
          exerciseItems: state.exerciseItems.map((i) => (i.id === itemId ? { ...i, ...input } : i)),
        })),

      deleteExerciseItem: (itemId) =>
        set((state) => ({ exerciseItems: state.exerciseItems.filter((i) => i.id !== itemId) })),

      logExerciseSet: (itemId, input) =>
        set((state) => ({
          exerciseItems: state.exerciseItems.map((i) =>
            i.id === itemId
              ? { ...i, logs: [{ id: `log-${crypto.randomUUID()}`, ...input }, ...i.logs] }
              : i,
          ),
        })),

      deleteExerciseLog: (itemId, logId) =>
        set((state) => ({
          exerciseItems: state.exerciseItems.map((i) =>
            i.id === itemId ? { ...i, logs: i.logs.filter((l) => l.id !== logId) } : i,
          ),
        })),

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
        const { missions: allMissions, goals: allGoals, regions: allRegions } = get()
        const mission = allMissions.find((m) => m.id === missionId)
        // isDoneForNow also blocks re-completing a repeating mission whose next
        // occurrence is in the future — no double XP for the same cycle.
        if (!mission || isDoneForNow(mission, today)) return

        // Which of the five player stats this mission feeds — an explicit
        // statFocus on the mission wins; otherwise infer from its goal's region.
        const goal = allGoals.find((g) => g.id === mission.goalId)
        const region = goal ? allRegions.find((r) => r.id === goal.regionId) : undefined
        const statKey = mission.statFocus ?? (region ? statForRegionCategory(region.category) : undefined)

        set((state) => {
          const missions = state.missions.map((m) => (m.id === missionId ? applyCompletion(m, today) : m))
          return {
            missions,
            ...deriveAfterMissionChange(state.goals, missions, state.regions),
            profile: applyMissionReward(state.profile, mission, today, statKey),
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
          financeEntries: [],
          incomeSources: [],
          fixedExpenses: [],
          usdToClp: DEFAULT_USD_TO_CLP,
          groceryItems: [],
          groceryPurchaseEntryId: null,
          exerciseItems: [],
          trainingDayNames: {},
          unlocks: [],
          equippedTitle: null,
          equippedAura: null,
          claimedAchievements: [],
          lastVerseDate: null,
          enabledModules: [...CORE_MODULE_IDS],
          moodLog: [],
          journalNotes: [],
          systems: [],
          people: [],
        }),

      // Runs the file through normalizeGameState, the same path a saved game
      // takes on load — so an older backup is migrated instead of breaking.
      importSnapshot: (data) =>
        set((state) => ({ ...state, ...normalizeGameState(data as Partial<GameState>) })),
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
