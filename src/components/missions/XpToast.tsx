import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useGameStore } from '@/store/useGameStore'

export function XpToast() {
  const lastGainedXp = useGameStore((s) => s.lastGainedXp)
  const clearLastGainedXp = useGameStore((s) => s.clearLastGainedXp)

  useEffect(() => {
    if (lastGainedXp === null) return
    const timeout = setTimeout(clearLastGainedXp, 1200)
    return () => clearTimeout(timeout)
  }, [lastGainedXp, clearLastGainedXp])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center">
      <AnimatePresence>
        {lastGainedXp !== null && (
          <motion.div
            key={lastGainedXp + Date.now().toString().slice(-2)}
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="rounded-full bg-gold-500 px-4 py-1.5 font-pixel text-xs text-ink-950 shadow-lg"
          >
            +{lastGainedXp} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
