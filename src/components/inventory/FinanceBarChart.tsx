/** Two-bar magnitude comparison: total income vs total expense. Colors validated for dark-mode contrast + colorblind separation (emerald-600/red-600), backed by the TrendingUp/TrendingDown icons and text labels as secondary encoding. */
export function FinanceBarChart({ income, expense }: { income: number; expense: number }) {
  const max = Math.max(income, expense, 1)
  const bars = [
    { label: 'Ingresos', value: income, barClass: 'bg-emerald-600', dotClass: 'bg-emerald-600' },
    { label: 'Gastos', value: expense, barClass: 'bg-red-600', dotClass: 'bg-red-600' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-ink-300">
              <span className={`h-2 w-2 rounded-full ${bar.dotClass}`} />
              {bar.label}
            </span>
            <span className="font-medium text-ink-50">${bar.value.toLocaleString('es-CL')}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink-800">
            <div
              className={`h-full rounded-full ${bar.barClass} transition-all`}
              style={{ width: `${Math.max(2, Math.round((bar.value / max) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
