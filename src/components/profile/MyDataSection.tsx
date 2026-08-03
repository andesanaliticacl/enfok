import { useRef, useState } from 'react'
import { Download, Upload, FileText, AlertTriangle } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { useAvatarStore } from '@/store/useAvatarStore'
import { todayKey } from '@/lib/calendar'
import { journalToMarkdown, journalToJson, parseSnapshot, downloadFile, type SnapshotSummary } from '@/lib/journal'
import { Button } from '@/components/ui/button'

/**
 * Everything Enfok stores for this profile, in and out: save a backup, load one
 * back, or take a readable summary. Loading replaces the current profile, so it
 * always shows what's inside the file and asks before applying it.
 */
export function MyDataSection() {
  const profileName = useGameStore((s) => s.profile.name)
  const importSnapshot = useGameStore((s) => s.importSnapshot)

  // What's on screen right now, so the user can compare it against the file
  // instead of guessing what "reemplazar" costs them. Selected as separate
  // primitives — returning an object here would be a new reference every render.
  const currentMissions = useGameStore((s) => s.missions.length)
  const currentFinance = useGameStore((s) => s.financeEntries.length)
  const currentExercises = useGameStore((s) => s.exerciseItems.length)
  const currentSystems = useGameStore((s) => s.systems.length)

  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ data: Record<string, unknown>; summary: SnapshotSummary } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  function handleSaveBackup() {
    const json = journalToJson(useGameStore.getState(), useAvatarStore.getState())
    downloadFile(`enfok-respaldo-${todayKey()}.json`, json, 'application/json')
    setDone('Respaldo descargado.')
    setTimeout(() => setDone(null), 3000)
  }

  function handleSaveSummary() {
    downloadFile(
      `enfok-resumen-${profileName}-${todayKey()}.md`,
      journalToMarkdown(useGameStore.getState()),
      'text/markdown',
    )
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset the input so choosing the same file twice still fires a change.
    e.target.value = ''
    if (!file) return

    setError(null)
    try {
      setPending(parseSnapshot(await file.text()))
    } catch (err) {
      setPending(null)
      setError(err instanceof Error ? err.message : 'No pudimos leer el archivo.')
    }
  }

  function confirmImport() {
    if (!pending) return
    importSnapshot(pending.data)

    // The avatar lives in its own store, so restore it alongside the game state.
    const avatarState = pending.data.avatarState
    if (avatarState && typeof avatarState === 'object') {
      useAvatarStore.setState(avatarState as Parameters<typeof useAvatarStore.setState>[0])
    }

    setPending(null)
    setDone('Datos restaurados desde el respaldo.')
    setTimeout(() => setDone(null), 4000)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] leading-relaxed text-ink-400">
        Todo lo que Enfok guarda de tu perfil: personaje, regiones, metas, misiones, finanzas, compras, ejercicios,
        sistemas y ánimo. Guárdalo cuando quieras y cárgalo en cualquier dispositivo.
      </p>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={handleSaveBackup}>
          <Download size={13} /> Guardar
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
          <Upload size={13} /> Cargar
        </Button>
      </div>

      <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFileChosen} className="hidden" />

      <Button size="sm" variant="ghost" onClick={handleSaveSummary}>
        <FileText size={13} /> Descargar resumen legible (.md)
      </Button>

      {error && <p className="text-[11px] text-red-400">{error}</p>}
      {done && <p className="text-center text-[11px] text-emerald-400">{done}</p>}

      {/* Restoring wipes the current profile — never do it on a single tap, and
          never without showing exactly what disappears. */}
      {pending && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/60 bg-red-950/25 p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-red-300">
            <AlertTriangle size={14} /> Cargar NO fusiona: reemplaza todo
          </p>

          <p className="text-[10px] leading-relaxed text-ink-200">
            Tus datos actuales se <strong className="text-red-300">borran por completo</strong> y quedan solo los del
            archivo. Lo que hayas hecho después de ese respaldo se pierde y no se puede deshacer.
          </p>

          {/* Side-by-side is what makes the trade concrete */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-ink-700 bg-ink-950/60 p-2">
              <p className="mb-1 text-[9px] uppercase tracking-wide text-red-300">Ahora (se borra)</p>
              <p className="text-[10px] leading-relaxed text-ink-400">
                {currentMissions} misiones
                <br />
                {currentFinance} movimientos
                <br />
                {currentExercises} ejercicios
                <br />
                {currentSystems} sistemas
              </p>
            </div>
            <div className="rounded-lg border border-ink-700 bg-ink-950/60 p-2">
              <p className="mb-1 text-[9px] uppercase tracking-wide text-emerald-300">Queda esto</p>
              <p className="text-[10px] leading-relaxed text-ink-400">
                {pending.summary.missions} misiones
                <br />
                {pending.summary.financeEntries} movimientos
                <br />
                {pending.summary.exercises} ejercicios
                <br />
                {pending.summary.systems} sistemas
              </p>
            </div>
          </div>

          <p className="text-[10px] leading-relaxed text-ink-300">
            Perfil del archivo: <strong className="text-ink-50">{pending.summary.profileName}</strong>
            <br />
            Guardado el {new Date(pending.summary.exportedAt).toLocaleString('es-CL')}
          </p>

          {/* The one action that makes this safe, offered right where the risk is */}
          <Button size="sm" variant="outline" onClick={handleSaveBackup}>
            <Download size={13} /> Guardar primero lo que tengo ahora
          </Button>

          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="flex-1" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button size="sm" className="flex-1 bg-red-600 text-ink-50 hover:bg-red-500" onClick={confirmImport}>
              Borrar y reemplazar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
