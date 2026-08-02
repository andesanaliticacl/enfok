import { useState } from 'react'

// Two hues (income=emerald, expense=red), each split fixed/espontáneo by shade —
// fixed is the deeper, steady tone; espontáneo the lighter, more volatile one.
const INGRESO_FIJO = '#065f46' // emerald-800
const INGRESO_ESPONTANEO = '#10b981' // emerald-500
const GASTO_FIJO = '#7f1d1d' // red-900
const GASTO_ESPONTANEO = '#ef4444' // red-500

export interface FinanceBarChartProps {
  /** All four figures already converted to one CLP-equivalent currency. */
  fixedIncome: number
  spontaneousIncome: number
  fixedExpense: number
  spontaneousExpense: number
}

/**
 * Two stacked bars — Ingresos and Gastos — each split into its fijo (steady,
 * darker) and espontáneo (variable, brighter) share, so at a glance you see
 * not just how much came in/out but how much of it you actually control
 * month to month. A hover/focus on either segment shows its exact value.
 */
export function FinanceBarChart({ fixedIncome, spontaneousIncome, fixedExpense, spontaneousExpense }: FinanceBarChartProps) {
  const [hover, setHover] = useState<string | null>(null)

  const totalIncome = fixedIncome + spontaneousIncome
  const totalExpense = fixedExpense + spontaneousExpense
  const max = Math.max(totalIncome, totalExpense, 1)
  const spentShare = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : totalExpense > 0 ? 100 : 0

  const rows: {
    key: string
    label: string
    total: number
    segments: { key: string; label: string; value: number; color: string }[]
  }[] = [
    {
      key: 'ingresos',
      label: 'Ingresos',
      total: totalIncome,
      segments: [
        { key: 'ingreso-fijo', label: 'Ingreso fijo', value: fixedIncome, color: INGRESO_FIJO },
        { key: 'ingreso-espontaneo', label: 'Ingreso espontáneo', value: spontaneousIncome, color: INGRESO_ESPONTANEO },
      ],
    },
    {
      key: 'gastos',
      label: 'Gastos',
      total: totalExpense,
      segments: [
        { key: 'gasto-fijo', label: 'Gasto fijo', value: fixedExpense, color: GASTO_FIJO },
        { key: 'gasto-espontaneo', label: 'Gasto espontáneo', value: spontaneousExpense, color: GASTO_ESPONTANEO },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* Legend — identity never rests on the bar color alone */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-ink-300">
        {rows.flatMap((r) => r.segments).map((seg) => (
          <span key={seg.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}
          </span>
        ))}
      </div>

      {rows.map((row) => (
        <div key={row.key} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-ink-300">{row.label}</span>
            <span className="font-medium text-ink-50">${Math.round(row.total).toLocaleString('es-CL')}</span>
          </div>
          <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-ink-800">
            {row.segments.map((seg) => {
              if (seg.value <= 0) return null
              const widthPct = Math.max(2, (seg.value / max) * 100)
              return (
                <div
                  key={seg.key}
                  role="button"
                  tabIndex={0}
                  aria-label={`${seg.label}: $${Math.round(seg.value).toLocaleString('es-CL')}`}
                  onMouseEnter={() => setHover(seg.key)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(seg.key)}
                  onBlur={() => setHover(null)}
                  className="h-full rounded-full outline-none transition-[filter]"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: seg.color,
                    filter: hover === seg.key ? 'brightness(1.25)' : undefined,
                  }}
                />
              )
            })}
          </div>
          {hover && row.segments.some((s) => s.key === hover) && (
            <p className="text-[10px] text-ink-400">
              {row.segments.find((s) => s.key === hover)!.label}: $
              {Math.round(row.segments.find((s) => s.key === hover)!.value).toLocaleString('es-CL')}
            </p>
          )}
        </div>
      ))}

      {/* The percentage the user asked for: how much of what came in went back out */}
      <div className="mt-1 rounded-xl border border-ink-800 bg-ink-900/60 p-2.5 text-center">
        <p className="text-[11px] text-ink-300">
          Gastaste el <span className="font-semibold text-gold-400">{spentShare}%</span> de lo que ingresó
        </p>
      </div>
    </div>
  )
}
