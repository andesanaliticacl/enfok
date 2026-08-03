import { Zap, Users, TriangleAlert, Target } from 'lucide-react'
import { systemHealth, autonomyColor } from '@/lib/systems/autonomy'
import type { LifeSystem } from '@/types'

/** Máximo de activos visibles: más de cuatro y deja de leerse de un vistazo. */
const MAX_ASSETS = 4

/**
 * Todo lo que hay que saber del sistema en cinco segundos: qué persigue, qué
 * produce, cuánto depende de ti y qué arreglar primero. Nada más.
 */
export function SystemHealthPanel({ system }: { system: LifeSystem }) {
  const health = systemHealth(system)
  const color = autonomyColor(health.autonomy)

  return (
    <div className="flex flex-col gap-2.5">
      {system.objective && (
        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-ink-200">
          <Target size={12} className="mt-0.5 shrink-0" style={{ color: system.color }} />
          {system.objective}
        </p>
      )}

      {/* La única métrica que importa: ¿puede funcionar sin mí? */}
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-wide text-ink-400">Autonomía</span>
          <span className="font-pixel text-[11px]" style={{ color }}>
            {health.autonomy}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.max(2, health.autonomy)}%`, backgroundColor: color }}
          />
        </div>
        <p className="mt-1 text-[10px] leading-snug text-ink-400">{health.verdict}</p>
      </div>

      {system.produces.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-400">Produce</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {system.produces.slice(0, MAX_ASSETS).map((asset) => (
              <span
                key={asset}
                className="rounded-full px-2 py-0.5 text-[10px]"
                style={{ backgroundColor: `${system.color}22`, color: system.color }}
              >
                {asset}
              </span>
            ))}
          </div>
        </div>
      )}

      {health.total > 0 && (
        <div className="flex flex-col gap-0.5 text-[10px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <Zap size={11} className="text-gold-400" /> Automatizado {health.automated} de {health.total} pasos
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={11} className="text-ink-300" /> Delegado {health.delegated} de {health.total} pasos
          </span>
        </div>
      )}

      {/* Un solo cuello de botella: el siguiente movimiento, no una lista de pendientes */}
      {health.bottleneck && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/25 p-2.5">
          <p className="flex items-center gap-1.5 text-[10px] font-medium text-red-300">
            <TriangleAlert size={11} /> Cuello de botella
          </p>
          <p className="mt-0.5 text-xs font-semibold text-ink-50">{health.bottleneck.label}</p>
          <p className="text-[10px] leading-snug text-ink-400">Todo el sistema espera esta etapa.</p>
        </div>
      )}
    </div>
  )
}
