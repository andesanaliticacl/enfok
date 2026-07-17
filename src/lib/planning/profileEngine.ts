import { addDaysToKey, todayKey } from '@/lib/calendar'
import type { Mission, PlayerProfile } from '@/types'

export const DEFAULT_DAILY_XP_GOAL = 50

/** Daily goal presets, Duolingo-style. */
export const DAILY_GOAL_PRESETS = [
  { id: 'relajado', label: 'Relajado', xp: 30 },
  { id: 'normal', label: 'Normal', xp: 50 },
  { id: 'intenso', label: 'Intenso', xp: 100 },
] as const

const RANKS: { minLevel: number; title: string }[] = [
  { minLevel: 30, title: 'Leyenda' },
  { minLevel: 20, title: 'Héroe' },
  { minLevel: 12, title: 'Veterano' },
  { minLevel: 7, title: 'Aventurero' },
  { minLevel: 3, title: 'Explorador' },
  { minLevel: 1, title: 'Novato' },
]

/** RPG rank title for a level — pure flavor, but it makes leveling feel like something. */
export function rankForLevel(level: number): string {
  return RANKS.find((r) => level >= r.minLevel)?.title ?? 'Novato'
}

/**
 * Streak as it should read *right now*: still alive if the last completion was
 * today or yesterday, otherwise broken (0). The stored streakDays is only
 * trustworthy together with lastActivityDate, so all UI reads go through here.
 */
export function effectiveStreak(profile: PlayerProfile, today = todayKey()): number {
  if (!profile.lastActivityDate) return 0
  return profile.lastActivityDate >= addDaysToKey(today, -1) ? profile.streakDays : 0
}

/** The streak survives but nothing was completed today yet — the Duolingo "at risk" state. */
export function streakAtRisk(profile: PlayerProfile, today = todayKey()): boolean {
  return effectiveStreak(profile, today) > 0 && profile.lastActivityDate !== today
}

export function xpEarnedToday(profile: PlayerProfile, today = todayKey()): number {
  return profile.xpTodayDate === today ? (profile.xpToday ?? 0) : 0
}

export function dailyXpGoal(profile: PlayerProfile): number {
  return profile.dailyXpGoal ?? DEFAULT_DAILY_XP_GOAL
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

/**
 * Every profile consequence of completing one mission, in one place:
 * XP + level-up, coins, streak (extend if yesterday was active, restart if not),
 * today's XP counter, and invested hours from the mission's estimated duration.
 */
export function applyMissionReward(profile: PlayerProfile, mission: Mission, today = todayKey()): PlayerProfile {
  const yesterday = addDaysToKey(today, -1)
  const streakDays =
    profile.lastActivityDate === today
      ? profile.streakDays
      : profile.lastActivityDate === yesterday
        ? profile.streakDays + 1
        : 1

  return applyLevelUp({
    ...profile,
    xp: profile.xp + mission.xp,
    coins: profile.coins + mission.coins,
    streakDays,
    lastActivityDate: today,
    xpToday: xpEarnedToday(profile, today) + mission.xp,
    xpTodayDate: today,
    hoursInvested: Math.round((profile.hoursInvested + (mission.estimatedMinutes ?? 0) / 60) * 10) / 10,
  })
}
