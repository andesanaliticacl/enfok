import { PLAYER_STATS } from '@/data/playerStats'
import type { PlayerStatKey } from '@/types'

interface PlayerStatsPanelProps {
  stats: Record<PlayerStatKey, number>
}

/** Caps the mini-bar fill so one runaway stat doesn't make the rest look empty — purely visual, the number itself is uncapped. */
const BAR_SCALE = 200

/**
 * The player's five-facet dashboard — Cuerpo/Disciplina/Mente/Finanzas/Corazón —
 * each fed by completed missions in that kind of place. One word per stat, a
 * small glowing icon, the number, and a thin bar. Lives right next to the
 * character, replacing the old generic "Estadísticas" tally.
 */
export function PlayerStatsPanel({ stats }: PlayerStatsPanelProps) {
  return (
    <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
      <h2 className="mb-3 text-xs uppercase tracking-wide text-ink-400">Panel de estadísticas</h2>
      <div className="flex flex-col gap-3">
        {PLAYER_STATS.map((stat) => {
          const value = stats[stat.key] ?? 0
          const pct = Math.min(100, Math.round((value / BAR_SCALE) * 100))
          return (
            <div key={stat.key} className="flex items-center gap-3" title={stat.description}>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base"
                style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 22%, transparent)` }}
              >
                {stat.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-medium text-ink-200">{stat.label}</span>
                  <span className="font-pixel text-[10px] text-ink-300">{value}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: stat.color }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
