import { useMemo, useState } from 'react'
import { Download, FileJson, Plus } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey } from '@/lib/calendar'
import {
  buildJournal,
  groupJournalByDate,
  journalToMarkdown,
  journalToJson,
  downloadFile,
  JOURNAL_KIND_LABELS,
  type JournalEntryKind,
} from '@/lib/journal'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const FILTERS: (JournalEntryKind | 'todo')[] = ['todo', 'mood', 'mission', 'finanza', 'ejercicio', 'nota']

/** Human date header: "hoy", "ayer", or the plain key. */
function dayLabel(date: string): string {
  const today = todayKey()
  if (date === today) return 'Hoy'
  const [y, m, d] = today.split('-').map(Number)
  const yesterday = new Date(y, m - 1, d - 1)
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  return date === yKey ? 'Ayer' : date
}

/**
 * Everything that happened, on one timeline, plus a way to take it with you.
 * The feed is derived from existing data — only the notes here are stored.
 */
export function JournalSection() {
  const addJournalNote = useGameStore((s) => s.addJournalNote)
  const deleteJournalNote = useGameStore((s) => s.deleteJournalNote)
  const profileName = useGameStore((s) => s.profile.name)

  // The journal spans most of the store, so subscribe to each source it reads —
  // that's what keeps the feed live when a mission or expense lands elsewhere.
  const moodLog = useGameStore((s) => s.moodLog)
  const journalNotes = useGameStore((s) => s.journalNotes)
  const missions = useGameStore((s) => s.missions)
  const financeEntries = useGameStore((s) => s.financeEntries)
  const exerciseItems = useGameStore((s) => s.exerciseItems)
  const goals = useGameStore((s) => s.goals)
  const regions = useGameStore((s) => s.regions)

  const [filter, setFilter] = useState<JournalEntryKind | 'todo'>('todo')
  const [note, setNote] = useState('')
  const [limit, setLimit] = useState(30)

  const journal = useMemo(
    () => buildJournal(useGameStore.getState()),
    [moodLog, journalNotes, missions, financeEntries, exerciseItems, goals, regions],
  )

  const filtered = filter === 'todo' ? journal : journal.filter((e) => e.kind === filter)
  const days = groupJournalByDate(filtered.slice(0, limit))

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    addJournalNote(note.trim())
    setNote('')
  }

  function exportMarkdown() {
    downloadFile(`bitacora-${profileName}-${todayKey()}.md`, journalToMarkdown(useGameStore.getState()), 'text/markdown')
  }

  function exportJson() {
    downloadFile(`enfok-backup-${todayKey()}.json`, journalToJson(useGameStore.getState()), 'application/json')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={exportMarkdown}>
          <Download size={13} /> Bitácora
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={exportJson}>
          <FileJson size={13} /> Respaldo
        </Button>
      </div>
      <p className="-mt-1 text-[10px] leading-relaxed text-ink-500">
        <strong className="text-ink-400">Bitácora</strong>: tu historia en texto, lista para leer o compartir.{' '}
        <strong className="text-ink-400">Respaldo</strong>: todos tus datos en JSON, por si quieres guardarlos aparte.
      </p>

      <form onSubmit={handleAddNote} className="flex gap-2">
        <Input
          placeholder="Anotar algo de hoy..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!note.trim()}>
          <Plus size={16} />
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full border border-ink-600 px-2.5 py-1 text-[10px] text-ink-300',
              filter === f && 'border-gold-400 bg-gold-500/20 text-gold-400',
            )}
          >
            {f === 'todo' ? 'Todo' : JOURNAL_KIND_LABELS[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[11px] text-ink-500">
          Aún no hay nada aquí. Completa una misión, registra un gasto o anota algo.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {days.map((day) => (
          <div key={day.date}>
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-ink-400">{dayLabel(day.date)}</p>
            <div className="flex flex-col gap-1.5">
              {day.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 rounded-xl border border-ink-700 bg-ink-900 p-2.5"
                >
                  <span className="text-sm leading-none" style={entry.color ? { color: entry.color } : undefined}>
                    {entry.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] leading-snug text-ink-50">{entry.title}</p>
                    {entry.detail && <p className="text-[10px] leading-snug text-ink-500">{entry.detail}</p>}
                  </div>
                  {entry.kind === 'nota' && (
                    <ConfirmDeleteButton variant="close" onConfirm={() => deleteJournalNote(entry.id)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length > limit && (
        <Button size="sm" variant="ghost" onClick={() => setLimit((l) => l + 30)}>
          Ver más ({filtered.length - limit} restantes)
        </Button>
      )}
    </div>
  )
}
