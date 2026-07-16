import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="flex min-h-full w-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex flex-col items-center gap-1 pb-2 text-center">
            <Sparkles className="text-gold-400" size={28} />
            <h1 className="font-pixel text-base text-gold-400">Questly</h1>
            <p className="text-xs text-ink-400">
              {mode === 'login' ? 'Inicia sesión para continuar tu aventura' : 'Crea tu cuenta para empezar'}
            </p>
          </div>

          {!isSupabaseConfigured && (
            <p className="rounded-lg border border-red-900/50 bg-red-950/20 p-3 text-[11px] text-red-300">
              Falta configurar VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
            </p>
          )}

          <div className="flex rounded-xl border border-ink-700 bg-ink-800 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-medium text-ink-400',
                mode === 'login' && 'bg-ink-900 text-gold-400',
              )}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={cn(
                'flex-1 rounded-lg py-1.5 text-xs font-medium text-ink-400',
                mode === 'signup' && 'bg-ink-900 text-gold-400',
              )}
            >
              Crear cuenta
            </button>
          </div>

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

            <Button type="submit" disabled={loading || !isSupabaseConfigured} className="mt-1">
              {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
