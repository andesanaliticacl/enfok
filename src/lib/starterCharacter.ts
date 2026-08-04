import { useAvatarStore } from '@/store/useAvatarStore'
import { useGameStore } from '@/store/useGameStore'

/** Palette the rest of Enfok already uses, so a random larva always looks like it belongs. */
export const LARVA_COLORS = [
  '#d47a4a',
  '#4a9b6e',
  '#4a7fd4',
  '#8a5fc9',
  '#d46a8a',
  '#4bb3c9',
  '#d4af37',
]

const NAME_MIN = 84
const NAME_MAX = 150

function randomOf<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** "Hola Mundo 117" — the number makes each first character feel issued to you. */
export function randomStarterName(): string {
  return `Hola Mundo ${NAME_MIN + Math.floor(Math.random() * (NAME_MAX - NAME_MIN + 1))}`
}

/**
 * Everyone starts as a larva instead of being stopped by a character builder:
 * you land inside the app, see what it does, and hatch into a real race when you
 * actually care. Idempotent — safe to call on every boot.
 */
export function ensureStarterCharacter() {
  const avatar = useAvatarStore.getState()
  if (avatar.hasCreatedCharacter) return

  avatar.startAsLarva(randomOf(LARVA_COLORS))
  useGameStore.getState().startNewProfile(randomStarterName())
}
