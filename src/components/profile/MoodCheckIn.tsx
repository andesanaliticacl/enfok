import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { todayKey } from '@/lib/calendar'
import { MOODS, MOOD_CHECKIN_HEART } from '@/data/moods'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { MoodKey } from '@/types'

/**
 * First thing you see each day: name what you feel. Answering grants Corazón and
 * writes the day's first bitácora entry — it can't be dismissed without answering,
 * because skipping it is what makes emotional tracking die after a week.
 */
export function MoodCheckIn() {
  const moodLog = useGameStore((s) => s.moodLog)
  const logMood = useGameStore((s) => s.logMood)

  const [selected, setSelected] = useState<MoodKey | null>(null)
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const alreadyLogged = moodLog.some((m) => m.date === todayKey())
  if (alreadyLogged && !confirmed) return null

  function handleConfirm() {
    if (!selected) return
    logMood(selected, note.trim() || undefined)
    setConfirmed(true)
    setTimeout(() => setConfirmed(false), 1800)
  }

  return (
    <AnimatePresence>
      {!alreadyLogged ? (
        <motion.div
          key="checkin"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-t-2xl border border-ink-700 bg-ink-900 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl sm:pb-5"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <h2 className="font-pixel text-sm text-gold-400">¿Cómo te sientes hoy?</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
              Ponerle nombre a lo que sientes suma +{MOOD_CHECKIN_HEART} a tu Corazón ❤️ y abre tu bitácora del día.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => setSelected(mood.key)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl border p-4 transition-transform active:scale-95',
                    selected === mood.key ? 'border-gold-400 bg-gold-500/10' : 'border-ink-700 bg-ink-950/60',
                  )}
                  style={selected === mood.key ? { borderColor: mood.color } : undefined}
                >
                  {/* A colour ring instead of a face — it fills in when chosen */}
                  <span
                    className="mb-1 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all"
                    style={{
                      borderColor: mood.color,
                      backgroundColor: selected === mood.key ? mood.color : 'transparent',
                      boxShadow: selected === mood.key ? `0 0 14px ${mood.color}66` : undefined,
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full transition-colors"
                      style={{ backgroundColor: selected === mood.key ? '#0b0d12' : mood.color }}
                    />
                  </span>
                  <span className="text-xs font-medium text-ink-50">{mood.label}</span>
                  <span className="text-[10px] text-ink-500">{mood.hint}</span>
                </button>
              ))}
            </div>

            <Input
              className="mt-3"
              placeholder="¿Algo que quieras anotar? (opcional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={140}
            />

            <Button className="mt-3 w-full" disabled={!selected} onClick={handleConfirm}>
              Registrar en mi bitácora
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        confirmed && (
          <motion.div
            key="granted"
            className="pointer-events-none fixed inset-x-0 top-6 z-[60] mx-auto w-fit rounded-full border border-gold-400/60 bg-ink-950/95 px-4 py-2"
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <p className="text-xs font-medium text-gold-400">❤️ +{MOOD_CHECKIN_HEART} Corazón</p>
          </motion.div>
        )
      )}
    </AnimatePresence>
  )
}
