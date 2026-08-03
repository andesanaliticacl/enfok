import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Check, Lock } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { INVENTORY_MODULES } from '@/data/inventoryModules'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { InventoryModuleId } from '@/types'

/**
 * Inventory is opt-in: you add the module you need and it wires itself into the
 * rest of the app. Switching one off only hides its tab — the data stays put.
 */
export function ModulesSection() {
  const enabledModules = useGameStore((s) => s.enabledModules)
  const enableModule = useGameStore((s) => s.enableModule)
  const disableModule = useGameStore((s) => s.disableModule)

  /** Which module just got added — drives the one-shot "¡Añadido!" flourish. */
  const [justAdded, setJustAdded] = useState<InventoryModuleId | null>(null)

  function handleAdd(id: InventoryModuleId) {
    enableModule(id)
    setJustAdded(id)
    setTimeout(() => setJustAdded((current) => (current === id ? null : current)), 1600)
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="mb-1 text-[11px] leading-relaxed text-ink-400">
        Arma tu inventario con lo que de verdad usas. Al añadir un módulo aparece como pestaña en Inventario y queda
        conectado con el resto.
      </p>

      {INVENTORY_MODULES.map((module) => {
        const enabled = enabledModules.includes(module.id)
        const added = justAdded === module.id
        return (
          <motion.div
            key={module.id}
            layout
            animate={added ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className={cn(
              'relative flex items-center gap-3 overflow-hidden rounded-xl border bg-ink-900 p-3',
              enabled ? 'border-gold-400/60' : 'border-ink-700',
            )}
          >
            {/* A gold sweep across the card is the "it's yours now" beat */}
            <AnimatePresence>
              {added && (
                <motion.span
                  className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-gold-400/25 to-transparent"
                  initial={{ left: '-35%' }}
                  animate={{ left: '110%' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
              )}
            </AnimatePresence>

            <span className="text-xl">{module.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-ink-50">{module.label}</p>
              <p className="text-[10px] leading-snug text-ink-500">{module.description}</p>
            </div>

            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="flex items-center gap-1 rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-semibold text-ink-950"
                >
                  <Check size={11} /> ¡Añadido!
                </motion.span>
              ) : module.core ? (
                <span
                  key="core"
                  className="flex items-center gap-1 text-[10px] text-ink-500"
                  title="Módulo base, siempre activo"
                >
                  <Lock size={11} /> Base
                </span>
              ) : enabled ? (
                <ConfirmDeleteButton
                  key="remove"
                  variant="close"
                  title="Quitar del inventario (no borra tus datos)"
                  onConfirm={() => disableModule(module.id)}
                />
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Button size="sm" variant="outline" onClick={() => handleAdd(module.id)}>
                    <Plus size={13} /> Añadir
                  </Button>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
