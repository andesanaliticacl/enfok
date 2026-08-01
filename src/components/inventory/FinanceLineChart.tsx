import { useMemo, useState } from 'react'

export interface MonthlyTotal {
  key: string
  label: string
  ingreso: number
  gasto: number
}

const INGRESO = '#059669' // emerald-600
const GASTO = '#dc2626' // red-600

/** Currency short form for the Y axis so labels don't collide: 1.2M, 340k, 900. */
function short(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(Math.round(value))
}

const full = (value: number) => `$${Math.round(value).toLocaleString('es-CL')}`

/** Rounds a raw max up to a clean axis top (1/2/5 × 10ⁿ) so gridline values read nicely. */
function niceMax(raw: number): number {
  if (raw <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / pow
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return step * pow
}

/**
 * Monthly ingreso/gasto trend. Interactive by default: a crosshair snaps to the
 * nearest month and a single tooltip lists both series at that point. Y axis is
 * gridded and labeled so the scale is legible; areas fill under each line.
 * Emerald-600/red-600 pair (validated for dark-mode + CVD separation), reinforced
 * by the legend and tooltip line-keys so identity never rests on color alone.
 */
export function FinanceLineChart({ months }: { months: MonthlyTotal[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const width = 340
  const height = 170
  const padLeft = 38
  const padRight = 12
  const padTop = 14
  const padBottom = 24
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom

  const rawMax = Math.max(...months.map((m) => Math.max(m.ingreso, m.gasto)), 0)
  const hasData = rawMax > 0
  const top = niceMax(rawMax)
  const stepX = months.length > 1 ? plotWidth / (months.length - 1) : 0

  const xAt = (i: number) => padLeft + stepX * i
  const yAt = (v: number) => padTop + plotHeight - (v / top) * plotHeight

  const ticks = useMemo(() => [0, top / 2, top], [top])

  function pointsOf(key: 'ingreso' | 'gasto') {
    return months.map((m, i) => ({ x: xAt(i), y: yAt(m[key]), value: m[key] }))
  }
  const ingresoPts = pointsOf('ingreso')
  const gastoPts = pointsOf('gasto')
  const line = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(' ')
  const area = (pts: { x: number; y: number }[]) =>
    `${pts.map((p) => `${p.x},${p.y}`).join(' ')} ${xAt(months.length - 1)},${yAt(0)} ${xAt(0)},${yAt(0)}`

  const active = hover != null ? months[hover] : null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-[11px] text-ink-300">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: INGRESO }} /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: GASTO }} /> Gastos
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full touch-none"
          role="img"
          aria-label="Tendencia mensual de ingresos y gastos"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="fin-ingreso" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={INGRESO} stopOpacity={0.28} />
              <stop offset="100%" stopColor={INGRESO} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fin-gasto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GASTO} stopOpacity={0.24} />
              <stop offset="100%" stopColor={GASTO} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Gridlines + Y labels give the plot a scale to read against */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padLeft} y1={yAt(t)} x2={width - padRight} y2={yAt(t)} stroke="var(--color-ink-800)" strokeWidth={1} />
              <text x={padLeft - 6} y={yAt(t) + 3} textAnchor="end" fontSize={9} fill="var(--color-ink-500)">
                {short(t)}
              </text>
            </g>
          ))}

          {hasData && (
            <>
              <polygon points={area(ingresoPts)} fill="url(#fin-ingreso)" />
              <polygon points={area(gastoPts)} fill="url(#fin-gasto)" />
              <polyline points={line(ingresoPts)} fill="none" stroke={INGRESO} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={line(gastoPts)} fill="none" stroke={GASTO} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* Crosshair on the hovered month */}
          {active && (
            <line x1={xAt(hover!)} y1={padTop} x2={xAt(hover!)} y2={padTop + plotHeight} stroke="var(--color-ink-600)" strokeWidth={1} strokeDasharray="3 3" />
          )}

          {hasData &&
            months.map((_, i) => (
              <g key={`dots-${i}`}>
                <circle cx={xAt(i)} cy={ingresoPts[i].y} r={hover === i ? 4.5 : 2.5} fill={INGRESO} stroke="var(--color-ink-900)" strokeWidth={hover === i ? 1.5 : 0} />
                <circle cx={xAt(i)} cy={gastoPts[i].y} r={hover === i ? 4.5 : 2.5} fill={GASTO} stroke="var(--color-ink-900)" strokeWidth={hover === i ? 1.5 : 0} />
              </g>
            ))}

          {/* Month labels */}
          {months.map((m, i) => (
            <text key={m.key} x={xAt(i)} y={height - 6} textAnchor="middle" fontSize={9} fill={hover === i ? 'var(--color-gold-400)' : 'var(--color-ink-400)'}>
              {m.label}
            </text>
          ))}

          {/* Transparent hit columns — the whole month band is the hover/focus target, not a 3px dot */}
          {months.map((m, i) => {
            const bandLeft = i === 0 ? padLeft : xAt(i) - stepX / 2
            const bandRight = i === months.length - 1 ? width - padRight : xAt(i) + stepX / 2
            return (
              <rect
                key={`hit-${m.key}`}
                x={bandLeft}
                y={padTop}
                width={Math.max(1, bandRight - bandLeft)}
                height={plotHeight}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${m.label}: ingresos ${full(m.ingreso)}, gastos ${full(m.gasto)}`}
                style={{ cursor: 'pointer', outline: 'none' }}
                onMouseEnter={() => setHover(i)}
                onMouseMove={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onPointerDown={() => setHover(i)}
              />
            )
          })}
        </svg>

        {/* Tooltip: value leads, series name follows; keyed by a short colored stroke */}
        {active && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-ink-700 bg-ink-950/95 px-2.5 py-1.5 shadow-lg"
            style={{
              left: `${((xAt(hover!) ) / width) * 100}%`,
              top: 2,
              transform: `translateX(${hover === 0 ? '0' : hover === months.length - 1 ? '-100%' : '-50%'})`,
            }}
          >
            <p className="mb-1 text-[10px] font-medium text-ink-200">{active.label}</p>
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px]">
                <span className="h-0.5 w-2.5 rounded-full" style={{ backgroundColor: INGRESO }} />
                <span className="font-semibold text-ink-50">{full(active.ingreso)}</span>
                <span className="text-ink-500">ingresos</span>
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px]">
                <span className="h-0.5 w-2.5 rounded-full" style={{ backgroundColor: GASTO }} />
                <span className="font-semibold text-ink-50">{full(active.gasto)}</span>
                <span className="text-ink-500">gastos</span>
              </span>
              <span className="mt-0.5 border-t border-ink-800 pt-0.5 text-[10px] text-ink-400">
                Balance {active.ingreso - active.gasto >= 0 ? '+' : ''}
                {full(active.ingreso - active.gasto).replace('$-', '-$')}
              </span>
            </div>
          </div>
        )}

        {!hasData && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-[11px] text-ink-500">Aún no hay movimientos en estos meses.</p>
          </div>
        )}
      </div>
    </div>
  )
}
