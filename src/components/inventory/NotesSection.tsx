import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { todayKey, diffDays, MONTH_LABELS } from '@/lib/calendar'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

/**
 * Fecha discreta: cerca se dice en días, lejos en fecha corta. Nadie necesita
 * ver "2026-08-03" en una nota que escribió hace un rato.
 */
function noteDate(date: string, today: string): string {
  const days = diffDays(date, today)
  if (days <= 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  const [, month, day] = date.split('-').map(Number)
  return `${day} ${MONTH_LABELS[month - 1].slice(0, 3).toLowerCase()}`
}

/**
 * Apuntes sueltos. La fecha se guarda sola al escribir y se muestra en pequeño,
 * porque el valor de una nota está en el texto, no en cuándo la escribiste — pero
 * meses después esa fecha es justo lo que te ubica.
 */
export function NotesSection() {
  const notes = useGameStore((s) => s.journalNotes)
  const addJournalNote = useGameStore((s) => s.addJournalNote)
  const updateJournalNote = useGameStore((s) => s.updateJournalNote)
  const deleteJournalNote = useGameStore((s) => s.deleteJournalNote)

  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const today = todayKey()

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    addJournalNote(draft.trim())
    setDraft('')
  }

  function saveEdit() {
    if (!editingId || !editText.trim()) return
    updateJournalNote(editingId, editText.trim())
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-50">Notas</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-400">
          Lo que no quieres olvidar y no es una misión. La fecha se guarda sola.
        </p>
      </div>

      <form onSubmit={handleAdd} className="panel-bevel flex flex-col gap-2 rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
        <Textarea
          placeholder="Escribe una nota..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={!draft.trim()}>
          <Plus size={14} /> Guardar nota
        </Button>
      </form>

      {notes.length === 0 && (
        <p className="text-center text-xs text-ink-400">Todavía no escribes ninguna nota.</p>
      )}

      <div className="flex flex-col gap-2">
        {notes.map((note) =>
          editingId === note.id ? (
            <div key={note.id} className="flex flex-col gap-2 rounded-xl border border-gold-400/50 bg-ink-950/60 p-3">
              <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} autoFocus />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit} disabled={!editText.trim()}>
                  <Check size={13} /> Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div key={note.id} className="rounded-xl border border-ink-700 bg-ink-900 p-3">
              {/* Tap the text to correct it — no pencil competing with the note itself */}
              <button
                onClick={() => {
                  setEditingId(note.id)
                  setEditText(note.text)
                }}
                className="w-full whitespace-pre-wrap text-left text-[13px] leading-relaxed text-ink-100"
              >
                {note.text}
              </button>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-ink-600">{noteDate(note.date, today)}</span>
                <ConfirmDeleteButton size={12} onConfirm={() => deleteJournalNote(note.id)} title="Eliminar nota" />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
