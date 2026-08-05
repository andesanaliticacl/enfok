import type { InventoryModuleId } from '@/types'

export interface InventoryModuleDef {
  id: InventoryModuleId
  label: string
  icon: string
  /** One line on the profile card: what this module actually does for you. */
  description: string
  /** Core modules can't be switched off — the app would lose its spine. */
  core?: boolean
}

/**
 * Inventory grows by choice: you add the module you need and it wires itself into
 * the rest (compras charges Finanzas, ejercicios feeds Cuerpo, and so on).
 */
export const INVENTORY_MODULES: InventoryModuleDef[] = [
  {
    id: 'finanzas',
    label: 'Finanzas',
    icon: '💰',
    description: 'Ingresos, gastos fijos y el balance real de tu mes.',
    core: true,
  },
  {
    id: 'compras',
    label: 'Compras del mes',
    icon: '🛒',
    description: 'Canasta por categorías que se descuenta sola de Finanzas.',
  },
  {
    id: 'ejercicios',
    label: 'Ejercicios',
    icon: '💪',
    description: 'Rutina por músculo y día, con récords personales.',
  },
  {
    id: 'sistemas',
    label: 'Sistemas',
    icon: '🧩',
    description: 'Diseña procesos que se repiten solos, paso a paso.',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: '🎯',
    description: 'Las oportunidades que te llegan, para que ninguna se te olvide.',
  },
]

export function inventoryModule(id: InventoryModuleId): InventoryModuleDef {
  return INVENTORY_MODULES.find((m) => m.id === id)!
}

export const CORE_MODULE_IDS: InventoryModuleId[] = INVENTORY_MODULES.filter((m) => m.core).map((m) => m.id)
