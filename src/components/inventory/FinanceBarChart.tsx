import { useState } from 'react'

const INGRESO = '#059669' // emerald-600
const GASTO = '#dc2626' // red-600

/** Two-bar magnitude comparison: total income vs total expense. Each bar is its own hover target — it lifts and shows the exact value + share on hover/focus. Emerald-600/red-600 validated for dark-mode contrast + CVD separation, backed by text labels as secondary encoding. */
export function FinanceBarChart({ income, expense }: { income: number; expense: number }) {
  const [hover, setHover] = useState<string | null>(null)
  const max = Math.max(income, expense, 1)
  const total = income + expense
  const bars = [
    { label: 'Ingresos', value: income, color: INGRESO },
    { label: 'Gastos', value: expense, color: GASTO },
  ]

  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar) => {
        const share = total > 0 ? Math.round((bar.value / total) * 100) : 0
        return (
          <div
            key={bar.label}
            className="flex flex-col gap-1 rounded-lg p-1 transition-colors"
            style={{ backgroundColor: hover === bar.label ? 'var(--color-ink-800)' : 'transparent' }}
            tabIndex={0}
            role="button"
            aria-label={`${bar.label}: $${bar.value.toLocaleString('es-CL')}, ${share}% del total`}
            onMouseEnter={() => setHover(bar.label)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(bar.label)}
            onBlur={() => setHover(null)}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-ink-300">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: bar.color }} />
                {bar.label}
              </span>
              <span className="flex items-center gap-2">
                {hover === bar.label && total > 0 && <span className="text-ink-500">{share}%</span>}
                <span className="font-medium text-ink-50">${bar.value.toLocaleString('es-CL')}</span>
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(2, Math.round((bar.value / max) * 100))}%`,
                  backgroundColor: bar.color,
                  filter: hover === bar.label ? 'brightness(1.15)' : undefined,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
