import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

interface AuthState {
  session: Session | null
  user: User | null
  /** True until the initial getSession() check resolves — avoids flashing the login screen for an already-signed-in user. */
  initializing: boolean
  /** True once Supabase fires PASSWORD_RECOVERY from the reset-password email link — gates the app to the reset screen. */
  passwordRecovery: boolean
  authError: string | null
  infoMessage: string | null
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, phone: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (newPassword: string) => Promise<boolean>
  signOut: () => Promise<void>
  clearMessages: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initializing: isSupabaseConfigured,
  passwordRecovery: false,
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

  resetPassword: async (email) => {
    if (!supabase) return false
    set({ authError: null, infoMessage: null })
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/`,
    })
    if (error) {
      set({ authError: error.message })
      return false
    }
    set({ infoMessage: 'Te enviamos un correo con el enlace para restablecer tu contraseña.' })
    return true
  },

  updatePassword: async (newPassword) => {
    if (!supabase) return false
    set({ authError: null, infoMessage: null })
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      set({ authError: error.message })
      return false
    }
    set({ passwordRecovery: false, infoMessage: 'Contraseña actualizada.' })
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

  supabase.auth.onAuthStateChange((event, session) => {
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
      initializing: false,
      ...(event === 'PASSWORD_RECOVERY' ? { passwordRecovery: true } : null),
    })
  })
}
