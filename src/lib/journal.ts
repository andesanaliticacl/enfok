import { moodDef } from '@/data/moods'
import { formatMoney } from '@/lib/planning/currency'
import { playerStats } from '@/lib/planning/profileEngine'
import { muscleGroup } from '@/data/muscleGroups'
import { PLAYER_STATS } from '@/data/playerStats'
import type { useGameStore } from '@/store/useGameStore'

type GameState = ReturnType<typeof useGameStore.getState>

export type JournalEntryKind = 'mood' | 'mission' | 'finanza' | 'ejercicio' | 'nota'

export interface JournalEntry {
  id: string
  /** ISO date (yyyy-mm-dd). */
  date: string
  kind: JournalEntryKind
  icon: string
  title: string
  detail?: string
  /** Tints the marker — moods are identified by colour instead of a face. */
  color?: string
}

export const JOURNAL_KIND_LABELS: Record<JournalEntryKind, string> = {
  mood: 'Ánimo',
  mission: 'Misiones',
  finanza: 'Finanzas',
  ejercicio: 'Ejercicio',
  nota: 'Notas',
}

/**
 * The bitácora is *derived*, not stored twice: everything already carries a date
 * (missions log completedAt, money entries a date, sets a date), so the timeline
 * is assembled on read. Only moods and free-text notes are stored for it.
 */
export function buildJournal(state: GameState): JournalEntry[] {
  const entries: JournalEntry[] = []

  for (const mood of state.moodLog) {
    const def = moodDef(mood.mood)
    entries.push({
      id: mood.id,
      date: mood.date,
      kind: 'mood',
      icon: '●',
      color: def.color,
      title: `Me sentí con ${def.label.toLowerCase()}`,
      detail: mood.note,
    })
  }

  for (const note of state.journalNotes) {
    entries.push({ id: note.id, date: note.date, kind: 'nota', icon: '📝', title: note.text })
  }

  for (const mission of state.missions) {
    if (!mission.lastCompletedOn) continue
    const goal = state.goals.find((g) => g.id === mission.goalId)
    const region = goal ? state.regions.find((r) => r.id === goal.regionId) : undefined
    entries.push({
      id: `mission-${mission.id}-${mission.lastCompletedOn}`,
      date: mission.lastCompletedOn,
      kind: 'mission',
      icon: '⚔️',
      title: `Completé "${mission.title}"`,
      detail: [goal?.name, region?.name, `+${mission.xp} XP`].filter(Boolean).join(' · '),
    })
  }

  for (const entry of state.financeEntries) {
    entries.push({
      id: `finance-${entry.id}`,
      date: entry.date,
      kind: 'finanza',
      icon: entry.type === 'ingreso' ? '📈' : '📉',
      title: `${entry.type === 'ingreso' ? 'Ingreso' : 'Gasto'}: ${entry.description}`,
      detail: formatMoney(entry.amount, entry.currency),
    })
  }

  for (const exercise of state.exerciseItems) {
    for (const log of exercise.logs) {
      entries.push({
        id: `set-${log.id}`,
        date: log.date,
        kind: 'ejercicio',
        icon: '🏋️',
        title: `${exercise.name}: ${log.weight}kg × ${log.reps}`,
        detail: muscleGroup(exercise.muscleGroup).label,
      })
    }
  }

  // Newest first — the bitácora reads like a feed of what just happened.
  return entries.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : b.date.localeCompare(a.date)))
}

/** Groups a journal into day buckets, newest day first. */
export function groupJournalByDate(entries: JournalEntry[]): { date: string; entries: JournalEntry[] }[] {
  const byDate = new Map<string, JournalEntry[]>()
  for (const entry of entries) {
    const bucket = byDate.get(entry.date)
    if (bucket) bucket.push(entry)
    else byDate.set(entry.date, [entry])
  }
  return [...byDate.entries()].map(([date, list]) => ({ date, entries: list }))
}

/** Human-readable logbook — what you'd paste into a doc or hand to someone. */
export function journalToMarkdown(state: GameState): string {
  const stats = playerStats(state.profile)
  const lines: string[] = [
    `# Bitácora de ${state.profile.name}`,
    '',
    `_Exportado el ${new Date().toLocaleString('es-CL')}_`,
    '',
    '## Estado actual',
    '',
    `- Nivel ${state.profile.level} · ${state.profile.xp}/${state.profile.xpToNextLevel} XP`,
    `- Racha: ${state.profile.streakDays} día(s)`,
    `- Monedas: ${state.profile.coins}`,
    `- Horas invertidas: ${state.profile.hoursInvested}`,
    `- Atributos: ${PLAYER_STATS.map((s) => `${s.label} ${stats[s.key]}`).join(' · ')}`,
    '',
  ]

  if (state.regions.length > 0) {
    lines.push('## Regiones y metas', '')
    for (const region of state.regions) {
      lines.push(`### ${region.emoji} ${region.name}`)
      const goals = state.goals.filter((g) => g.regionId === region.id)
      if (goals.length === 0) lines.push('- (sin metas)')
      for (const goal of goals) {
        lines.push(`- **${goal.name}** — ${goal.status}`)
        for (const mission of state.missions.filter((m) => m.goalId === goal.id)) {
          lines.push(`  - [${mission.status === 'completada' ? 'x' : ' '}] ${mission.title} (${mission.date})`)
        }
      }
      lines.push('')
    }
  }

  if (state.systems.length > 0) {
    lines.push('## Sistemas', '')
    for (const system of state.systems) {
      lines.push(`### ${system.icon} ${system.name}`)
      lines.push(system.steps.map((s) => s.label).join(' → ') + (system.loops ? ' → ↻' : ''))
      lines.push('')
    }
  }

  const journal = buildJournal(state)
  if (journal.length > 0) {
    lines.push('## Actividad', '')
    for (const { date, entries } of groupJournalByDate(journal)) {
      lines.push(`### ${date}`)
      for (const entry of entries) {
        lines.push(`- ${entry.icon} ${entry.title}${entry.detail ? ` — ${entry.detail}` : ''}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

export const SNAPSHOT_VERSION = 1

/** What a backup file looks like once parsed — enough to tell the user what they're about to restore. */
export interface SnapshotSummary {
  profileName: string
  exportedAt: string
  missions: number
  financeEntries: number
  exercises: number
  systems: number
}

/**
 * Reads a backup file and rejects anything that isn't one, so a wrong file can
 * never half-overwrite a profile. Returns the parsed payload plus a summary to
 * show before applying it.
 */
export function parseSnapshot(raw: string): { data: Record<string, unknown>; summary: SnapshotSummary } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }

  if (!parsed || typeof parsed !== 'object') throw new Error('El archivo no tiene el formato esperado.')
  const data = parsed as Record<string, unknown>
  if (!data.profile || typeof data.profile !== 'object') {
    throw new Error('Este archivo no parece un respaldo de Enfok.')
  }

  const count = (key: string) => (Array.isArray(data[key]) ? (data[key] as unknown[]).length : 0)
  return {
    data,
    summary: {
      profileName: (data.profile as { name?: string }).name ?? 'Sin nombre',
      exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : 'fecha desconocida',
      missions: count('missions'),
      financeEntries: count('financeEntries'),
      exercises: count('exerciseItems'),
      systems: count('systems'),
    },
  }
}

/** Full machine-readable snapshot — a real backup you can keep or re-import later. */
export function journalToJson(state: GameState, avatarState?: unknown): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: SNAPSHOT_VERSION,
      avatarState,
      profile: state.profile,
      regions: state.regions,
      goals: state.goals,
      missions: state.missions,
      activityLog: state.activityLog,
      financeEntries: state.financeEntries,
      incomeSources: state.incomeSources,
      fixedExpenses: state.fixedExpenses,
      groceryItems: state.groceryItems,
      groceryPurchaseEntryId: state.groceryPurchaseEntryId,
      exerciseItems: state.exerciseItems,
      trainingDayNames: state.trainingDayNames,
      moodLog: state.moodLog,
      journalNotes: state.journalNotes,
      systems: state.systems,
      // Without the roster, every step's personId would point at nobody on restore.
      people: state.people,
      enabledModules: state.enabledModules,
      unlocks: state.unlocks,
      equippedTitle: state.equippedTitle,
      equippedAura: state.equippedAura,
      claimedAchievements: state.claimedAchievements,
      lastVerseDate: state.lastVerseDate,
      usdToClp: state.usdToClp,
      worldAnchor: state.worldAnchor,
    },
    null,
    2,
  )
}

/** Triggers a browser download without leaving the app. */
export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
