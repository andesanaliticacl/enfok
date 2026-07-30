import { useState } from 'react'
import { Coins, Check, Store } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { SHOP_ITEMS, type ShopCategory, type ShopItem } from '@/data/shop'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CATEGORY_TABS: { id: ShopCategory; label: string }[] = [
  { id: 'titulo', label: 'Títulos' },
  { id: 'aura', label: 'Auras' },
  { id: 'stickers', label: 'Stickers' },
]

/** The coin sink: buy titles/auras/sticker packs, and equip what you own. */
export function ShopSection() {
  const coins = useGameStore((s) => s.profile.coins)
  const unlocks = useGameStore((s) => s.unlocks)
  const equippedTitle = useGameStore((s) => s.equippedTitle)
  const equippedAura = useGameStore((s) => s.equippedAura)
  const purchaseShopItem = useGameStore((s) => s.purchaseShopItem)
  const equipTitle = useGameStore((s) => s.equipTitle)
  const equipAura = useGameStore((s) => s.equipAura)

  const [category, setCategory] = useState<ShopCategory>('titulo')

  const items = SHOP_ITEMS.filter((i) => i.category === category)

  function equippedId(item: ShopItem): string | null {
    return item.category === 'titulo' ? equippedTitle : item.category === 'aura' ? equippedAura : null
  }

  function toggleEquip(item: ShopItem) {
    const next = equippedId(item) === item.id ? null : item.id
    if (item.category === 'titulo') equipTitle(next)
    else if (item.category === 'aura') equipAura(next)
  }

  return (
    <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/85 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-400">
          <Store size={14} /> Tienda
        </h2>
        <span className="flex items-center gap-1 text-xs font-medium text-gold-400">
          <Coins size={13} /> {coins}
        </span>
      </div>

      <div className="mb-3 flex gap-1.5">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            className={cn(
              'flex-1 rounded-full border border-ink-600 px-2 py-1 text-[11px] text-ink-300',
              category === tab.id && 'border-gold-400 bg-gold-500/20 text-gold-400',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const owned = unlocks.includes(item.id)
          const equipped = equippedId(item) === item.id
          const affordable = coins >= item.price
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-900 p-3',
                equipped && 'border-gold-400',
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-50">{item.name}</p>
                <p className="text-[10px] leading-snug text-ink-500">{item.description}</p>
              </div>
              {owned ? (
                item.category === 'stickers' ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <Check size={12} /> Tuyo
                  </span>
                ) : (
                  <Button size="sm" variant={equipped ? 'default' : 'outline'} onClick={() => toggleEquip(item)}>
                    {equipped ? 'En uso' : 'Equipar'}
                  </Button>
                )
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!affordable}
                  onClick={() => purchaseShopItem(item.id, item.price)}
                  title={affordable ? undefined : 'Te faltan monedas — completa misiones para ganar más'}
                >
                  <Coins size={12} /> {item.price}
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-ink-500">
        Gana monedas completando misiones y reclamando logros. Los packs de stickers aparecen al decorar tu bioma.
      </p>
    </section>
  )
}
