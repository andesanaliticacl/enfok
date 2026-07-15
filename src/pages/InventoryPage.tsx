import { useGameStore } from '@/store/useGameStore'
import { Card, CardContent } from '@/components/ui/card'
import { PageContainer } from '@/components/layout/PageContainer'

export function InventoryPage() {
  const inventory = useGameStore((s) => s.inventory)

  return (
    <PageContainer>
      <h1 className="mb-6 font-pixel text-lg text-gold-400">Inventario</h1>
      <div className="grid grid-cols-2 gap-3">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <span className="text-3xl">{item.icon}</span>
              <p className="text-sm font-medium text-ink-50">{item.name}</p>
              <p className="text-[11px] text-ink-400">
                {item.linkedGoalIds.length} meta(s) asociada(s)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
