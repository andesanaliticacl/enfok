import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

interface AuthState {
  session: Session | null
  user: User | null
  /** True until the initial getSession() check resolves — avoids flashing the login screen for an already-signed-in user. */
  initializing: boolean
  authError: string | null
  infoMessage: string | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, phone: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearMessages: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initializing: isSupabaseConfigured,
  authError: null,
  infoMessage: null,

  signIn: async (email, password) => {
    if (!supabase) return false
    set({ authError: null, infoMessage: null })
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) {
      set({ authError: error.message })
      return false
    }
    return true
  },

  signUp: async (email, password, phone) => {
    if (!supabase) return false
    set({ authError: null, infoMessage: null })
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password })
    if (error) {
      set({ authError: error.message })
      return false
    }

    const userId = data.user?.id
    if (userId) {
      await supabase.from('profiles').upsert({ id: userId, phone: phone.trim() || null })
    }

    if (!data.session) {
      set({ infoMessage: 'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.' })
    }
    return true
  },

  signOut: async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  },

  clearMessages: () => set({ authError: null, infoMessage: null }),
}))

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, user: data.session?.user ?? null, initializing: false })
  })

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null, initializing: false })
  })
}
