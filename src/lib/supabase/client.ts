import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/**
 * Where the links in auth emails (confirmar cuenta, recuperar contraseña) send
 * people back to. Pinned to the deployed app rather than `window.location.origin`
 * so a mail triggered from a dev machine still opens the real site — set
 * VITE_SITE_URL to override (e.g. a preview deploy).
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://enfok.vercel.app'

/** Null when VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY aren't set — callers must check `isSupabaseConfigured` first. */
export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!) : null
