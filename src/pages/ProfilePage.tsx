import { useGameStore } from '@/store/useGameStore'
import { Card, CardContent } from '@/components/ui/card'

export function ProfilePage() {
  const profile = useGameStore((s) => s.profile)
  const regions = useGameStore((s) => s.regions)

  const unlockedRegions = regions.filter((r) => r.level > 0).length

  const stats = [
    { label: 'Nivel', value: profile.level },
    { label: 'XP', value: profile.xp },
    { label: 'Monedas', value: profile.coins },
    { label: 'Racha', value: `${profile.streakDays} días` },
    { label: 'Horas invertidas', value: profile.hoursInvested },
    { label: 'Regiones', value: `${unlockedRegions}/${regions.length}` },
  ]

  return (
    <div>
      <header className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-ink-800 text-4xl">
          🧙
        </div>
        <h1 className="mt-3 text-lg font-semibold text-ink-50">{profile.name}</h1>
        <p className="font-pixel text-[10px] text-gold-400">Nivel {profile.level}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-[11px] text-ink-400">{stat.label}</p>
              <p className="mt-1 text-lg font-semibold text-ink-50">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
