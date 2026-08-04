import { motion } from 'framer-motion'
import { Target, Swords, ArrowRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Explains the one rule that makes the whole planner make sense: a meta is the
 * destination, misiones are the steps that arrive there — so the meta is created
 * first. Shown large when there's nothing yet, and as a thin reminder after.
 */
export function MissionHierarchyGuide({
  variant,
  onCreateGoal,
}: {
  variant: 'full' | 'compact'
  onCreateGoal?: () => void
}) {
  if (variant === 'compact') {
    return (
      <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-ink-800 bg-ink-900/60 px-3 py-2">
        <span className="flex items-center gap-1 text-[10px] text-ink-300">
          <Swords size={11} className="text-ink-400" /> Misiones
        </span>
        <ArrowRight size={11} className="text-ink-600" />
        <span className="flex items-center gap-1 text-[10px] font-medium text-gold-400">
          <Target size={11} /> Meta
        </span>
        <span className="ml-1 text-[10px] text-ink-500">— cada misión te acerca a su meta</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-5"
    >
      <p className="text-center font-pixel text-[11px] leading-relaxed text-gold-400">
        Primero la meta.
        <br />
        Después las misiones.
      </p>

      {/* The destination sits on top; the steps climb toward it */}
      <div className="mt-5 flex flex-col items-center">
        <div className="flex w-full max-w-[240px] flex-col items-center rounded-2xl border-2 border-gold-400/70 bg-gold-500/10 p-3">
          <Target size={22} className="text-gold-400" />
          <p className="mt-1 font-pixel text-[9px] text-gold-400">LA META</p>
          <p className="mt-1 text-center text-[10px] leading-snug text-ink-300">
            A dónde quieres llegar.
            <br />
            <span className="text-ink-500">"Correr 10K en marzo"</span>
          </p>
        </div>

        {/* Rising connector: the missions feed upward into the goal */}
        <div className="flex flex-col items-center py-1">
          <div className="h-5 w-px bg-gradient-to-t from-ink-600 to-gold-400/70" />
          <span className="-mt-1 text-[10px] text-gold-400">▲</span>
        </div>

        <div className="flex w-full max-w-[280px] flex-col gap-1.5">
          {['Comprar zapatillas', 'Trotar 3K el lunes', 'Trotar 5K el jueves'].map((example, i) => (
            <div
              key={example}
              className="flex items-center gap-2 rounded-xl border border-ink-700 bg-ink-950/60 px-2.5 py-1.5"
            >
              <Swords size={11} className="shrink-0 text-ink-400" />
              <span className="text-[10px] text-ink-300">{example}</span>
              {i === 0 && <span className="ml-auto text-[9px] text-ink-600">misión</span>}
            </div>
          ))}
        </div>

        <p className="mt-3 max-w-[300px] text-center text-[10px] leading-relaxed text-ink-400">
          Las misiones son los <strong className="text-ink-200">pasos con fecha</strong>. La meta es{' '}
          <strong className="text-ink-200">el final del camino</strong>. Por eso una misión siempre vive dentro de una
          meta.
        </p>
      </div>

      {onCreateGoal && (
        <Button className="mt-5 w-full" onClick={onCreateGoal}>
          <Plus size={15} /> Crear mi primera meta
        </Button>
      )}
    </motion.div>
  )
}
