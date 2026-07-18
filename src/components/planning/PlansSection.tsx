import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Rocket, CheckCircle2 } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { goalProgress } from '@/lib/planning/goalEngine'
import { PLANS, type PlanTemplate } from '@/data/plans'
import { regionCategory } from '@/data/regionCategories'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Express plans: prebuilt 12-week programs (like training plans, but for any
 * life change). Starting one creates its goal + missions inside a region the
 * player picks — this replaces the old decorative inventory.
 */
export function PlansSection() {
  const navigate = useNavigate()
  const regions = useGameStore((s) => s.regions)
  const goals = useGameStore((s) => s.goals)
  const missions = useGameStore((s) => s.missions)
  const startPlan = useGameStore((s) => s.startPlan)

  const [picking, setPicking] = useState<PlanTemplate | null>(null)

  function handleStart(plan: PlanTemplate, regionId: string) {
    const goalId = startPlan(plan.id, regionId)
    setPicking(null)
    if (goalId) navigate('/misiones')
  }

  return (
    <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
      <h2 className="mb-1 text-xs uppercase tracking-wide text-ink-400">Planes exprés</h2>
      <p className="mb-3 text-[11px] leading-relaxed text-ink-400">
        Programas de 3 meses listos para empezar: crean la meta y todas sus misiones de una vez.
      </p>

      <div className="flex flex-col gap-3">
        {PLANS.map((plan) => {
          const activeGoal = goals.find((g) => g.planId === plan.id && g.status !== 'completado')
          const completed = !activeGoal && goals.some((g) => g.planId === plan.id && g.status === 'completado')
          const progress = activeGoal ? goalProgress(activeGoal, missions) : 0

          return (
            <div
              key={plan.id}
              className="rounded-xl border border-ink-700 bg-ink-900 p-3"
              style={{ borderLeftWidth: 3, borderLeftColor: plan.color }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-xl">{plan.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-50">{plan.name}</p>
                    <p className="text-[10px] text-ink-400">
                      {plan.durationWeeks} semanas · sugerido: {regionCategory(plan.suggestedCategory).label}
                    </p>
                  </div>
                </div>
                {completed ? (
                  <span className="flex shrink-0 items-center gap-1 font-pixel text-[9px] text-gold-400">
                    <CheckCircle2 size={12} /> Logrado
                  </span>
                ) : activeGoal ? (
                  <span className="shrink-0 font-pixel text-[9px] text-gold-400">{progress}%</span>
                ) : (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => setPicking(plan)}>
                    <Rocket size={12} /> Comenzar
                  </Button>
                )}
              </div>

              <p className="mt-1.5 text-[11px] leading-relaxed text-ink-400">{plan.description}</p>

              {activeGoal && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: plan.color }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={!!picking} onClose={() => setPicking(null)} title={picking ? `Comenzar: ${picking.name}` : ''}>
        {picking && (
          <div className="flex flex-col gap-3">
            {regions.length === 0 ? (
              <>
                <p className="text-sm leading-relaxed text-ink-300">
                  Los planes viven en una región — un lugar real de tu vida. Crea primero una en el mapa (para este plan
                  se sugiere {regionCategory(picking.suggestedCategory).icon}{' '}
                  {regionCategory(picking.suggestedCategory).label.toLowerCase()}).
                </p>
                <Button
                  onClick={() => {
                    setPicking(null)
                    navigate('/')
                  }}
                >
                  Ir al mapa a crear mi región
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-ink-400">¿En qué región de tu mundo vivirá este plan?</p>
                <div className="flex flex-col gap-2">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => handleStart(picking, region.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3 text-left hover:border-gold-400',
                        region.category === picking.suggestedCategory && 'border-gold-400/50',
                      )}
                    >
                      <span className="text-xl">{region.emoji}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-ink-50">{region.name}</span>
                        <span className="block text-[10px] text-ink-400">
                          {regionCategory(region.category).label}
                          {region.category === picking.suggestedCategory && ' · Sugerida para este plan'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Dialog>
    </section>
  )
}
