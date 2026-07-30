import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/useAuthStore'
import { BiomaComponent } from '@/components/biome/BiomaComponent'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ResetPasswordPage() {
  const { updatePassword, authError, infoMessage, clearMessages } = useAuthStore()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearMessages()
    if (password.length < 6) return
    if (password !== confirmPassword) {
      useAuthStore.setState({ authError: 'Las contraseñas no coinciden.' })
      return
    }
    setLoading(true)
    await updatePassword(password)
    setLoading(false)
  }

  return (
    <div className="relative min-h-full w-full overflow-hidden">
      <BiomaComponent biomeId="espacio" variant="dark" vignette className="absolute inset-0" />
      <div className="absolute inset-0 bg-ink-950/45" />

      <div className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6 text-center"
        >
          <h1 className="font-pixel text-2xl tracking-wide text-gold-400 text-glow-gold">ENFOK</h1>
          <p className="mt-3 text-xs text-ink-300">Define tu nueva contraseña</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <motion.div
            key={authError ?? 'ok'}
            animate={authError ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="panel-bevel rounded-2xl border border-ink-700/80 bg-ink-900/75 p-6 shadow-2xl backdrop-blur-md"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <label className="text-xs text-ink-400">
                Nueva contraseña
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </label>

              <label className="text-xs text-ink-400">
                Confirmar contraseña
                <Input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="mt-1"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </label>

              {authError && <p className="text-[11px] text-red-400">{authError}</p>}
              {infoMessage && <p className="text-[11px] text-emerald-400">{infoMessage}</p>}

              <Button type="submit" disabled={loading} className="anim-glow-pulse mt-1">
                {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
