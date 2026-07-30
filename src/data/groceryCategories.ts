import type { GroceryCategory } from '@/types'

export interface GroceryCategoryDef {
  id: GroceryCategory
  label: string
  icon: string
}

/** Categorías básicas de una compra de supermercado mensual. */
export const GROCERY_CATEGORIES: GroceryCategoryDef[] = [
  { id: 'carnes', label: 'Carnes', icon: '🥩' },
  { id: 'lacteos', label: 'Lácteos', icon: '🧀' },
  { id: 'huevos', label: 'Huevos', icon: '🥚' },
  { id: 'vegetales', label: 'Vegetales', icon: '🥦' },
  { id: 'frutas', label: 'Frutas', icon: '🍎' },
  { id: 'congelados', label: 'Congelados', icon: '🧊' },
  { id: 'suplementos', label: 'Suplementos', icon: '💊' },
  { id: 'limpieza', label: 'Limpieza', icon: '🧴' },
  { id: 'dulces', label: 'Dulces', icon: '🍬' },
  { id: 'otros', label: 'Otros', icon: '📦' },
]

export function groceryCategory(id: GroceryCategory): GroceryCategoryDef {
  return GROCERY_CATEGORIES.find((c) => c.id === id) ?? GROCERY_CATEGORIES[GROCERY_CATEGORIES.length - 1]
}
