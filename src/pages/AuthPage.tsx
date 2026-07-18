import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { BiomaComponent } from '@/components/biome/BiomaComponent'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AuthPage() {
  const { signIn, signUp, authError, infoMessage, clearMessages } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(next: 'login' | 'signup') {
    setMode(next)
    clearMessages()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    if (mode === 'login') {
      await signIn(email, password)
    } else {
      await signUp(email, password, phone)
    }
    setLoading(false)
  }

  return (
    <div className="relative min-h-full w-full overflow-hidden">
      {/* The night sky of the game world, alive behind the door */}
      <BiomaComponent biomeId="espacio" variant="dark" vignette className="absolute inset-0" />
      <div className="absolute inset-0 bg-ink-950/45" />

      <div className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6 text-center"
        >
          <h1 className="font-pixel text-2xl tracking-wide text-gold-400 text-glow-gold">QUESTLY</h1>
          <p className="mt-3 text-xs text-ink-300">Planifica tu vida como una aventura</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Shake the card when auth fails — feedback you can feel */}
          <motion.div
            key={authError ?? 'ok'}
            animate={authError ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="panel-bevel rounded-2xl border border-ink-700/80 bg-ink-900/75 p-6 shadow-2xl backdrop-blur-md"
          >
            {!isSupabaseConfigured && (
              <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-[11px] text-red-300">
                Falta configurar VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
              </p>
            )}

            <div className="relative mb-4 flex rounded-xl border border-ink-700 bg-ink-950/60 p-1">
              <motion.span
                layout
                className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-ink-800"
                animate={{ left: mode === 'login' ? 4 : 'calc(50% + 0px)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={cn(
                  'relative z-10 flex-1 rounded-lg py-1.5 text-xs font-medium text-ink-400 transition-colors',
                  mode === 'login' && 'text-gold-400',
                )}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={cn(
                  'relative z-10 flex-1 rounded-lg py-1.5 text-xs font-medium text-ink-400 transition-colors',
                  mode === 'signup' && 'text-gold-400',
                )}
              >
                Crear cuenta
              </button>
            </div>

            <p className="mb-4 text-center text-[11px] text-ink-400">
              {mode === 'login' ? 'Tu mundo te espera donde lo dejaste.' : 'Toda aventura comienza con un nombre en el registro.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="text-xs text-ink-400">
                Correo
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </label>

              <label className="text-xs text-ink-400">
                Contraseña
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </label>

              {mode === 'signup' && (
                <label className="text-xs text-ink-400">
                  Teléfono (opcional)
                  <Input
                    type="tel"
                    autoComplete="tel"
                    className="mt-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+56 9 1234 5678"
                  />
                  <span className="mt-1 block text-[10px] text-ink-500">
                    Lo guardamos para más adelante poder crear misiones mandando un WhatsApp — todavía no está activo.
                  </span>
                </label>
              )}

              {authError && <p className="text-[11px] text-red-400">{authError}</p>}
              {infoMessage && <p className="text-[11px] text-emerald-400">{infoMessage}</p>}

              <Button type="submit" disabled={loading || !isSupabaseConfigured} className="anim-glow-pulse mt-1">
                {loading ? 'Cargando...' : mode === 'login' ? 'Entrar a mi mundo' : 'Comenzar mi aventura'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
