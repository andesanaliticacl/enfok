import { Dumbbell, Flame, Brain, Coins, Heart } from 'lucide-react'
import { PLAYER_STATS } from '@/data/playerStats'
import type { PlayerStatKey } from '@/types'

interface PlayerStatsPanelProps {
  stats: Record<PlayerStatKey, number>
}

/** Each stat maxes out its ring at 100 — a completed mission always adds exactly 1. */
const STAT_SCALE = 100

const STAT_ICON: Record<PlayerStatKey, typeof Dumbbell> = {
  cuerpo: Dumbbell,
  disciplina: Flame,
  mente: Brain,
  finanzas: Coins,
  corazon: Heart,
}

const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 78
const RINGS = [0.25, 0.5, 0.75, 1]

/** Point on the pentagon for axis `i` (0 = top, clockwise) at a given 0–1 fraction of the radius. */
function axisPoint(i: number, fraction: number) {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
  return { x: CENTER + Math.cos(angle) * RADIUS * fraction, y: CENTER + Math.sin(angle) * RADIUS * fraction }
}

function polygonPoints(fraction: number | number[]) {
  return PLAYER_STATS.map((_, i) => {
    const f = Array.isArray(fraction) ? fraction[i] : fraction
    const p = axisPoint(i, f)
    return `${p.x},${p.y}`
  }).join(' ')
}

/**
 * The player's five-facet dashboard as an RPG stat wheel — a radar/pentagon
 * chart right beside the character, no emoji, line-icons at each vertex. Each
 * axis maxes at 100; a completed mission always adds exactly 1 to its stat.
 */
export function PlayerStatsPanel({ stats }: PlayerStatsPanelProps) {
  const fractions = PLAYER_STATS.map((s) => Math.min(1, (stats[s.key] ?? 0) / STAT_SCALE))

  return (
    <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
      <h2 className="mb-1 text-xs uppercase tracking-wide text-ink-400">Estadísticas</h2>
      <div className="relative mx-auto aspect-square w-full max-w-[240px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id="stat-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-gold-400)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--color-gold-500)" stopOpacity={0.15} />
            </radialGradient>
          </defs>

          {/* Reference rings */}
          {RINGS.map((r) => (
            <polygon key={r} points={polygonPoints(r)} fill="none" stroke="var(--color-ink-700)" strokeWidth={1} />
          ))}

          {/* Axis spokes */}
          {PLAYER_STATS.map((_, i) => {
            const p = axisPoint(i, 1)
            return <line key={i} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="var(--color-ink-800)" strokeWidth={1} />
          })}

          {/* The player's current shape */}
          <polygon
            points={polygonPoints(fractions)}
            fill="url(#stat-fill)"
            stroke="var(--color-gold-400)"
            strokeWidth={1.5}
            style={{ filter: 'drop-shadow(0 0 6px rgba(242,204,109,0.45))' }}
          />
          {PLAYER_STATS.map((_, i) => {
            const p = axisPoint(i, fractions[i])
            return <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--color-gold-400)" />
          })}
        </svg>

        {/* Icon + value at each vertex, placed with the same axis math as percentages */}
        {PLAYER_STATS.map((stat, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
          const labelR = (RADIUS + 26) / SIZE
          const left = 50 + Math.cos(angle) * labelR * 100
          const top = 50 + Math.sin(angle) * labelR * 100
          const Icon = STAT_ICON[stat.key]
          const value = stats[stat.key] ?? 0
          return (
            <div
              key={stat.key}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
              style={{ left: `${left}%`, top: `${top}%` }}
              title={stat.description}
            >
              <Icon size={15} style={{ color: stat.color }} />
              <span className="text-[9px] font-medium leading-none text-ink-300">{stat.label}</span>
              <span className="font-pixel text-[9px] leading-none text-gold-400">{value}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
