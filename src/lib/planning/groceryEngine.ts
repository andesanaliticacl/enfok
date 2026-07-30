import type { GroceryItem } from '@/types'

export const GROCERY_EXPENSE_DESCRIPTION = 'Compras del mes (supermercado)'

/** What one line costs: the price is per unit, so it scales with how many you take. */
export function groceryLineTotal(item: GroceryItem): number {
  return item.quantity * (item.price ?? 0)
}

export function groceryTotal(items: GroceryItem[]): number {
  return items.reduce((sum, item) => sum + groceryLineTotal(item), 0)
}

/** Only the items actually marked as bought — this is what Finanzas charges. */
export function checkedGroceryTotal(items: GroceryItem[]): number {
  return groceryTotal(items.filter((i) => i.checked))
}
