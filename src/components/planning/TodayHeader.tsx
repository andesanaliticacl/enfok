import { useMemo } from 'react'
import { Flame, Zap } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey } from '@/lib/calendar'
import { isDoneForNow } from '@/lib/planning/missionEngine'
import { dailyXpGoal, effectiveStreak, streakAtRisk, xpEarnedToday } from '@/lib/planning/profileEngine'
import { cn } from '@/lib/utils'

/**
 * The Duolingo-style daily strip: streak flame, daily XP goal and how much of
 * today's plan is already done. Lives above the Misiones views.
 */
export function TodayHeader() {
  const profile = useGameStore((s) => s.profile)
  const missions = useGameStore((s) => s.missions)

  const today = todayKey()
  const streak = effectiveStreak(profile, today)
  const atRisk = streakAtRisk(profile, today)
  const xpToday = xpEarnedToday(profile, today)
  const xpGoal = dailyXpGoal(profile)
  const xpProgress = Math.min(100, Math.round((xpToday / xpGoal) * 100))

  const { dueToday, doneToday } = useMemo(() => {
    const doneToday = missions.filter((m) => m.lastCompletedOn === today).length
    const dueToday = missions.filter((m) => m.date <= today && !isDoneForNow(m, today)).length
    return { dueToday, doneToday }
  }, [missions, today])

  return (
    <div className="panel-bevel mb-6 rounded-2xl border border-ink-700 bg-ink-900/70 p-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center">
          <Flame
            size={28}
            className={cn(streak > 0 && !atRisk ? 'text-gold-400' : atRisk ? 'text-orange-400' : 'text-ink-600')}
            fill={streak > 0 ? 'currentColor' : 'none'}
          />
          <p className="font-pixel text-[10px] text-ink-50">{streak}d</p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1 text-xs font-medium text-ink-200">
              <Zap size={12} className="text-gold-400" /> Meta diaria
            </p>
            <p className="font-pixel text-[9px] text-gold-400">
              {xpToday}/{xpGoal} XP
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-950/70">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                xpProgress >= 100 ? 'bg-emerald-400' : 'bg-gold-400',
              )}
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-ink-400">
            {xpProgress >= 100
              ? '¡Meta diaria cumplida! 🎉'
              : atRisk
                ? `Completa una misión hoy para no perder tu racha de ${streak} días 🔥`
                : dueToday > 0
                  ? `${dueToday} misión${dueToday === 1 ? '' : 'es'} para hoy · ${doneToday} completada${doneToday === 1 ? '' : 's'}`
                  : doneToday > 0
                    ? `${doneToday} completada${doneToday === 1 ? '' : 's'} hoy — sigue así`
                    : 'Planifica tu día: agrega una misión para hoy'}
          </p>
        </div>
      </div>
    </div>
  )
}
