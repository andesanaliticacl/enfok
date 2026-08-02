import { useNavigate } from 'react-router-dom'
import { X, Plus, ChevronRight, Target, ListChecks } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { goalProgress } from '@/lib/planning/goalEngine'
import { isDoneForNow } from '@/lib/planning/missionEngine'
import { regionCategory } from '@/data/regionCategories'
import { todayKey } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import type { Region } from '@/types'

interface RegionSheetProps {
  region: Region
  onClose: () => void
  /** Opens the goal form pre-scoped to this region — the map's "Nueva meta aquí". */
  onNewGoal: (regionId: string) => void
}

/**
 * The bridge between the map and the planner: tapping a place shows what you're
 * working on there — its goals, their progress, and how many missions are still
 * pending — right on the map, with one tap into the region or a new goal.
 */
export function RegionSheet({ region, onClose, onNewGoal }: RegionSheetProps) {
  const navigate = useNavigate()
  const allGoals = useGameStore((s) => s.goals)
  const missions = useGameStore((s) => s.missions)

  const today = todayKey()
  const goals = allGoals.filter((g) => g.regionId === region.id)
  const goalIds = new Set(goals.map((g) => g.id))
  const pendingTotal = missions.filter((m) => goalIds.has(m.goalId) && !isDoneForNow(m, today)).length
  const cat = regionCategory(region.category)

  function pendingOf(goalId: string) {
    return missions.filter((m) => m.goalId === goalId && !isDoneForNow(m, today)).length
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 mx-auto max-h-[70%] w-full max-w-md overflow-y-auto rounded-t-3xl border border-ink-700 bg-ink-950/97 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
      {/* Header: the place itself */}
      <div className="mb-3 flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `color-mix(in srgb, ${region.color} 25%, transparent)` }}
        >
          {region.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-50">{region.name}</p>
          <p className="truncate text-[11px] text-ink-400">
            {cat.label} · Nivel {region.level}
          </p>
        </div>
        <button onClick={onClose} className="shrink-0 text-ink-400 hover:text-ink-50">
          <X size={18} />
        </button>
      </div>

      {/* The connection made explicit: what's pending here */}
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-ink-800 bg-ink-900/60 p-2.5">
        <ListChecks size={16} className={pendingTotal > 0 ? 'text-gold-400' : 'text-ink-500'} />
        <p className="flex-1 text-[11px] text-ink-300">
          {goals.length === 0
            ? 'Sin metas todavía en este lugar.'
            : pendingTotal > 0
              ? `${pendingTotal} misión${pendingTotal === 1 ? '' : 'es'} pendiente${pendingTotal === 1 ? '' : 's'} aquí.`
              : 'Todo al día en este lugar 🎉'}
        </p>
      </div>

      {/* Goals living in this place */}
      {goals.length > 0 && (
        <div className="mb-3 flex flex-col gap-1.5">
          {goals.map((goal) => {
            const progress = goalProgress(goal, missions)
            const pending = pendingOf(goal.id)
            return (
              <button
                key={goal.id}
                onClick={() => navigate(`/region/${region.id}`)}
                className="flex items-center gap-2.5 rounded-xl border border-ink-700 bg-ink-900 p-2.5 text-left hover:border-gold-400"
              >
                <span className="text-lg">{goal.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-50">{goal.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-800">
                      <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                    </div>
                    <span className="shrink-0 text-[9px] text-ink-400">
                      {pending > 0 ? `${pending} pend.` : `${progress}%`}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="shrink-0 text-ink-500" />
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/region/${region.id}`)}>
          <Target size={14} /> Abrir región
        </Button>
        <Button size="sm" className="flex-1" onClick={() => onNewGoal(region.id)}>
          <Plus size={14} /> Nueva meta
        </Button>
      </div>
    </div>
  )
}
