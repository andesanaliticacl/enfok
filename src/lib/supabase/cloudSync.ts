import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useGameStore, normalizeGameState } from '@/store/useGameStore'
import { useAvatarStore } from '@/store/useAvatarStore'

const SAVE_DEBOUNCE_MS = 1500

let activeUserId: string | null = null
let hydrating = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

function pickGameState() {
  const s = useGameStore.getState()
  return {
    regions: s.regions,
    goals: s.goals,
    missions: s.missions,
    profile: s.profile,
    activityLog: s.activityLog,
    worldAnchor: s.worldAnchor,
  }
}

function pickAvatarState() {
  const s = useAvatarStore.getState()
  return {
    hasCreatedCharacter: s.hasCreatedCharacter,
    avatar: s.avatar,
    biome: s.biome,
    biomeArt: s.biomeArt,
    biomeVariant: s.biomeVariant,
  }
}

async function pushToCloud(userId: string) {
  if (!supabase) return
  await supabase.from('app_state').upsert({
    user_id: userId,
    game_state: pickGameState(),
    avatar_state: pickAvatarState(),
    updated_at: new Date().toISOString(),
  })
}

function scheduleSave() {
  if (!activeUserId || hydrating) return
  if (saveTimer) clearTimeout(saveTimer)
  const userId = activeUserId
  saveTimer = setTimeout(() => pushToCloud(userId), SAVE_DEBOUNCE_MS)
}

async function hydrateFromCloud(userId: string) {
  if (!supabase) return
  hydrating = true
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('game_state, avatar_state')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('No se pudo cargar el estado desde Supabase', error)
      return
    }

    if (data) {
      if (data.game_state && Object.keys(data.game_state).length > 0) {
        // Cloud rows can predate user-created regions — bring them up to the current model.
        useGameStore.setState(normalizeGameState(data.game_state))
      }
      if (data.avatar_state && Object.keys(data.avatar_state).length > 0) {
        useAvatarStore.setState(data.avatar_state)
      }
    } else {
      // Brand new account, first sign-in anywhere — this browser's local
      // stores may still hold demo content (or a previous local session),
      // so start this account from a clean slate instead of uploading that.
      useGameStore.getState().resetToFreshStart()
      useAvatarStore.getState().deleteCharacter()
      await pushToCloud(userId)
    }
  } finally {
    hydrating = false
  }
}

/** Call whenever the signed-in user changes (including to null on sign-out). */
export function setActiveUser(userId: string | null) {
  if (userId === activeUserId) return
  activeUserId = userId
  if (userId) hydrateFromCloud(userId)
}

if (isSupabaseConfigured) {
  useGameStore.subscribe(scheduleSave)
  useAvatarStore.subscribe(scheduleSave)
}
