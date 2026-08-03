import { useState } from 'react'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { muscleGroup } from '@/data/muscleGroups'
import { toClp, formatMoney } from '@/lib/planning/currency'
import { cn } from '@/lib/utils'

type RankingTab = 'pr' | 'ingresos' | 'gastos'

const TABS: { id: RankingTab; label: string; icon: typeof Trophy }[] = [
  { id: 'pr', label: 'Marcas', icon: Trophy },
  { id: 'ingresos', label: 'Ingresos', icon: TrendingUp },
  { id: 'gastos', label: 'Gastos', icon: TrendingDown },
]

const MEDALS = ['🥇', '🥈', '🥉']

/** A podium is three. Beyond that it stops being a ranking and becomes a list. */
const PODIUM_SIZE = 3

/** Podium colouring for the top three, plain ink after that. */
function rankAccent(index: number): string {
  return index === 0 ? 'text-gold-400' : index < 3 ? 'text-ink-100' : 'text-ink-300'
}

/** Three leaderboards over data you already have: heaviest lifts, biggest income, biggest spend. */
export function RankingsSection() {
  const exerciseItems = useGameStore((s) => s.exerciseItems)
  const financeEntries = useGameStore((s) => s.financeEntries)
  const incomeSources = useGameStore((s) => s.incomeSources)
  const fixedExpenses = useGameStore((s) => s.fixedExpenses)
  const usdToClp = useGameStore((s) => s.usdToClp)

  const [tab, setTab] = useState<RankingTab>('pr')

  // Best set per exercise, heaviest first.
  const prRanking = exerciseItems
    .map((item) => {
      const best = item.logs.reduce<(typeof item.logs)[number] | null>(
        (top, log) => (!top || log.weight > top.weight ? log : top),
        null,
      )
      return best ? { id: item.id, name: item.name, group: muscleGroup(item.muscleGroup), best } : null
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.best.weight - a.best.weight)
    .slice(0, PODIUM_SIZE)

  // Fixed sources count as one recurring line alongside the one-off entries.
  const incomeRanking = [
    ...incomeSources.map((s) => ({ id: s.id, label: s.name, clp: toClp(s.amount, s.currency, usdToClp), tag: 'Fijo' })),
    ...financeEntries
      .filter((e) => e.type === 'ingreso')
      .map((e) => ({ id: e.id, label: e.description, clp: toClp(e.amount, e.currency, usdToClp), tag: e.date })),
  ]
    .sort((a, b) => b.clp - a.clp)
    .slice(0, PODIUM_SIZE)

  const expenseRanking = [
    ...fixedExpenses.map((e) => ({ id: e.id, label: e.name, clp: toClp(e.amount, e.currency, usdToClp), tag: 'Fijo' })),
    ...financeEntries
      .filter((e) => e.type === 'gasto')
      .map((e) => ({ id: e.id, label: e.description, clp: toClp(e.amount, e.currency, usdToClp), tag: e.date })),
  ]
    .sort((a, b) => b.clp - a.clp)
    .slice(0, PODIUM_SIZE)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-full border border-ink-600 px-2 py-1 text-[11px] text-ink-300',
              tab === id && 'border-gold-400 bg-gold-500/20 text-gold-400',
            )}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {tab === 'pr' && (
        <div className="flex flex-col gap-1.5">
          {prRanking.length === 0 && (
            <p className="text-center text-[11px] text-ink-500">Registra series en Ejercicios para armar tu ranking.</p>
          )}
          {prRanking.map((row, index) => (
            <div key={row.id} className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900 p-2.5">
              <span className="w-6 text-center text-xs">{MEDALS[index] ?? index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-xs font-medium', rankAccent(index))}>{row.name}</p>
                <p className="text-[10px] text-ink-500">
                  {row.group.icon} {row.group.label} · {row.best.date}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gold-400">
                {row.best.weight}kg × {row.best.reps}
              </span>
            </div>
          ))}
        </div>
      )}

      {(tab === 'ingresos' || tab === 'gastos') && (
        <div className="flex flex-col gap-1.5">
          {(tab === 'ingresos' ? incomeRanking : expenseRanking).length === 0 && (
            <p className="text-center text-[11px] text-ink-500">
              Sin {tab === 'ingresos' ? 'ingresos' : 'gastos'} registrados todavía.
            </p>
          )}
          {(tab === 'ingresos' ? incomeRanking : expenseRanking).map((row, index) => (
            <div key={row.id} className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-900 p-2.5">
              <span className="w-6 text-center text-xs">{MEDALS[index] ?? index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-xs font-medium', rankAccent(index))}>{row.label}</p>
                <p className="text-[10px] text-ink-500">{row.tag}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-xs font-semibold',
                  tab === 'ingresos' ? 'text-emerald-400' : 'text-red-400',
                )}
              >
                {formatMoney(row.clp, 'CLP')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
