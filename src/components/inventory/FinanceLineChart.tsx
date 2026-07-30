export interface MonthlyTotal {
  key: string
  label: string
  ingreso: number
  gasto: number
}

/** Monthly ingreso/gasto trend. Same validated emerald-600/red-600 pair as the bar chart, so the two charts read as one system. */
export function FinanceLineChart({ months }: { months: MonthlyTotal[] }) {
  const width = 320
  const height = 140
  const padX = 8
  const padTop = 12
  const padBottom = 24
  const plotWidth = width - padX * 2
  const plotHeight = height - padTop - padBottom

  const max = Math.max(...months.map((m) => Math.max(m.ingreso, m.gasto)), 1)
  const stepX = months.length > 1 ? plotWidth / (months.length - 1) : 0

  function points(key: 'ingreso' | 'gasto') {
    return months.map((m, i) => {
      const x = padX + stepX * i
      const y = padTop + plotHeight - (m[key] / max) * plotHeight
      return { x, y, value: m[key] }
    })
  }

  const ingresoPoints = points('ingreso')
  const gastoPoints = points('gasto')
  const toPath = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-[11px] text-ink-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-600" /> Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-600" /> Gastos
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Tendencia mensual de ingresos y gastos">
        <line x1={padX} y1={padTop + plotHeight} x2={width - padX} y2={padTop + plotHeight} stroke="var(--color-ink-700)" strokeWidth={1} />

        <polyline points={toPath(ingresoPoints)} fill="none" stroke="#059669" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={toPath(gastoPoints)} fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {ingresoPoints.map((p, i) => (
          <circle key={`i-${months[i].key}`} cx={p.x} cy={p.y} r={3} fill="#059669">
            <title>{`${months[i].label}: ingresos $${p.value.toLocaleString('es-CL')}`}</title>
          </circle>
        ))}
        {gastoPoints.map((p, i) => (
          <circle key={`g-${months[i].key}`} cx={p.x} cy={p.y} r={3} fill="#dc2626">
            <title>{`${months[i].label}: gastos $${p.value.toLocaleString('es-CL')}`}</title>
          </circle>
        ))}

        {months.map((m, i) => (
          <text
            key={m.key}
            x={padX + stepX * i}
            y={height - 6}
            textAnchor="middle"
            fontSize={9}
            fill="var(--color-ink-400)"
          >
            {m.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
