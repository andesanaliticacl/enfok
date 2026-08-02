import { useState } from 'react'
import { BookOpen, Check, Sparkles } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey } from '@/lib/calendar'
import { verseForDate, verseXp } from '@/data/verses'
import { cn } from '@/lib/utils'

/**
 * The daily verse: a brief, reflective passage shown once a day. Reading it
 * grants XP equal to the verse number (a "número santificado según el
 * versículo"), floored so it's always worth the pause. Collapses to a quiet
 * read-only note once claimed.
 */
export function DailyVerseCard() {
  const today = todayKey()
  const lastVerseDate = useGameStore((s) => s.lastVerseDate)
  const claimDailyVerse = useGameStore((s) => s.claimDailyVerse)

  const verse = verseForDate(today)
  const xp = verseXp(verse)
  const alreadyRead = lastVerseDate === today
  const [justRead, setJustRead] = useState(false)
  const read = alreadyRead || justRead

  function handleRead() {
    claimDailyVerse(xp)
    setJustRead(true)
  }

  return (
    <div
      className={cn(
        'panel-bevel relative overflow-hidden rounded-2xl border p-5',
        read ? 'border-ink-700 bg-ink-900/80' : 'border-gold-500/50 bg-gradient-to-br from-gold-500/10 via-ink-900/90 to-ink-900/90',
      )}
      style={read ? undefined : { boxShadow: '0 0 24px rgba(242,204,109,0.12)' }}
    >
      {/* Soft radial glow behind an unread verse */}
      {!read && <div className="anim-aura pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-500/20 blur-2xl" />}

      <div className="relative flex items-start gap-3">
        <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', read ? 'bg-ink-800 text-ink-400' : 'bg-gold-500/20 text-gold-400')}>
          <BookOpen size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide text-ink-400">
            Versículo del día
            {read && (
              <span className="flex items-center gap-0.5 text-emerald-400">
                <Check size={11} /> Leído
              </span>
            )}
          </p>

          <p className={cn('text-sm italic leading-relaxed', read ? 'text-ink-300' : 'text-ink-50')}>
            «{verse.text}»
          </p>
          <p className="mt-1.5 font-pixel text-[9px] text-gold-400">{verse.reference}</p>

          {!read ? (
            <button
              onClick={handleRead}
              className="anim-glow-pulse mt-3 flex items-center gap-1.5 rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-semibold text-ink-950"
            >
              <Sparkles size={13} /> Marcar como leído · +{xp} XP
            </button>
          ) : justRead ? (
            <p className="mt-2 text-[11px] text-emerald-400">✨ +{xp} XP — que acompañe tu día.</p>
          ) : (
            <p className="mt-2 text-[11px] text-ink-500">Vuelve mañana por un nuevo versículo.</p>
          )}
        </div>
      </div>
    </div>
  )
}
