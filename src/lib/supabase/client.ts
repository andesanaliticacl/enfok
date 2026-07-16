import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** Null when VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY aren't set — callers must check `isSupabaseConfigured` first. */
export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!) : null
