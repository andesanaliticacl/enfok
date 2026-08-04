import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Goal } from '@/types'

/** Sparks fired outward from the goal — fixed angles so the burst reads as a star, not noise. */
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  return { id: i, x: Math.cos(angle) * 110, y: Math.sin(angle) * 110, delay: 0.35 + (i % 4) * 0.04 }
})

/** Rays behind the goal, sweeping outward as it lands. */
const RAYS = Array.from({ length: 8 }, (_, i) => i * 45)

/**
 * The moment the first meta exists. It's the one beat in the app where nothing
 * else matters: the goal drops in, the world flashes gold, and the next step is
 * named out loud — break it into missions.
 */
export function FirstGoalCelebration({ goal, onClose, onCreateMission }: {
  goal: Goal | null
  onClose: () => void
  onCreateMission: () => void
}) {
  return (
    <AnimatePresence>
      {goal && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-ink-950/92 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Gold wash that flares once as the goal lands */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 42%, rgba(242,204,109,0.28), transparent 62%)' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.55], scale: [0.5, 1.25, 1] }}
            transition={{ duration: 1.1, times: [0, 0.45, 1], delay: 0.25 }}
          />

          <div className="relative flex w-full max-w-sm flex-col items-center text-center">
            <motion.p
              className="font-pixel text-[10px] tracking-widest text-ink-400"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              TU PRIMERA META
            </motion.p>

            <div className="relative mt-6 flex h-40 w-40 items-center justify-center">
              {RAYS.map((deg) => (
                <motion.span
                  key={deg}
                  className="absolute h-20 w-px origin-bottom bg-gradient-to-t from-transparent to-gold-400/70"
                  style={{ rotate: `${deg}deg`, translateY: '-50%' }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: [0, 1.15, 1], opacity: [0, 0.9, 0.35] }}
                  transition={{ duration: 1, delay: 0.4, times: [0, 0.5, 1] }}
                />
              ))}

              {SPARKS.map((spark) => (
                <motion.span
                  key={spark.id}
                  className="absolute h-1.5 w-1.5 rounded-full bg-gold-400"
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{ x: spark.x, y: spark.y, opacity: [0, 1, 0], scale: [0, 1.2, 0.2] }}
                  transition={{ duration: 0.95, delay: spark.delay, ease: 'easeOut' }}
                />
              ))}

              {/* The goal itself: drops from above, overshoots, settles */}
              <motion.div
                className="relative flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-gold-400 bg-gold-500/15"
                initial={{ y: -160, scale: 0.4, opacity: 0, rotate: -12 }}
                animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.2 }}
                style={{ boxShadow: '0 0 42px rgba(242,204,109,0.45)' }}
              >
                <span className="text-5xl">{goal.icon}</span>
              </motion.div>
            </div>

            <motion.h2
              className="mt-6 text-lg font-semibold text-ink-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              {goal.name}
            </motion.h2>

            {/* The lesson the moment exists to teach */}
            <motion.div
              className="mt-5 w-full rounded-2xl border border-ink-700 bg-ink-900/80 p-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
            >
              <div className="flex items-center justify-center gap-2.5 text-[11px]">
                <span className="flex items-center gap-1 text-ink-400">
                  <Swords size={12} /> Misiones
                </span>
                <span className="text-ink-600">──▶</span>
                <span className="flex items-center gap-1 font-medium text-gold-400">
                  <Target size={12} /> Meta
                </span>
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-ink-300">
                Ya tienes el destino. Ahora divídelo en{' '}
                <strong className="text-ink-50">misiones con fecha</strong>: cada una es un paso que te acerca a esta
                meta.
              </p>
            </motion.div>

            <motion.div
              className="mt-5 flex w-full flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.15 }}
            >
              <Button onClick={onCreateMission} className="anim-glow-pulse w-full">
                Crear la primera misión
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Ahora no
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
