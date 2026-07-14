import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Pencil, Globe2 } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { useAvatarStore } from '@/store/useAvatarStore'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import { biomes } from '@/data/biomes'
import { achievements } from '@/data/achievements'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function ProfilePage() {
  const navigate = useNavigate()
  const profile = useGameStore((s) => s.profile)
  const regions = useGameStore((s) => s.regions)
  const missions = useGameStore((s) => s.missions)
  const { avatar, biome: biomeId, biomeArt, deleteCharacter } = useAvatarStore()

  const [settingsOpen, setSettingsOpen] = useState(false)

  const unlockedRegions = regions.filter((r) => r.level > 0).length
  const biome = biomes.find((b) => b.id === biomeId)
  const missionsCompleted = useMemo(() => missions.filter((m) => m.status === 'completada').length, [missions])

  const stats = [
    { label: 'Nivel', value: profile.level },
    { label: 'XP', value: profile.xp },
    { label: 'Monedas', value: profile.coins },
    { label: 'Racha', value: `${profile.streakDays} días` },
    { label: 'Horas invertidas', value: profile.hoursInvested },
    { label: 'Regiones', value: `${unlockedRegions}/${regions.length}` },
  ]

  function handleDeleteCharacter() {
    deleteCharacter()
    setSettingsOpen(false)
    navigate('/')
  }

  return (
    <div>
      <header className="mb-6 flex flex-col items-center text-center">
        <div
          className="flex items-center justify-center rounded-2xl border border-ink-700"
          style={{
            backgroundImage: biomeArt ? `url(${biomeArt})` : undefined,
            backgroundColor: biome?.color ?? 'var(--color-ink-800)',
            backgroundSize: 'cover',
            imageRendering: 'pixelated',
          }}
        >
          <AvatarSprite config={avatar} size={128} />
        </div>
        <h1 className="mt-3 text-lg font-semibold text-ink-50">{profile.name}</h1>
        <p className="font-pixel text-[10px] text-gold-400">Nivel {profile.level}</p>
        {biome && (
          <p className="mt-1 text-xs text-ink-400">
            {biome.emoji} Mundo: {biome.name}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/personaje/editar')}>
            <Pencil size={14} /> Editar personaje
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/personaje/bioma')}>
            <Globe2 size={14} /> Cambiar bioma
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
          </Button>
        </div>
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

      <section className="mt-6">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Logros</h2>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement) => {
            const unlocked = achievement.isUnlocked({
              missionsCompleted,
              streakDays: profile.streakDays,
              hoursInvested: profile.hoursInvested,
              level: profile.level,
            })
            return (
              <div
                key={achievement.id}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border border-ink-700 bg-ink-900 p-3 text-center',
                  !unlocked && 'opacity-30',
                )}
                title={achievement.description}
              >
                <span className="text-2xl">{achievement.icon}</span>
                <span className="text-[10px] text-ink-200">{achievement.name}</span>
              </div>
            )
          })}
        </div>
      </section>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Configuración">
        <div className="flex flex-col gap-4">
          <p className="text-[11px] leading-relaxed text-ink-400">
            Avatar creado con assets de{' '}
            <a href={lpcProvider.attribution.url} target="_blank" rel="noreferrer" className="underline">
              {lpcProvider.attribution.name}
            </a>{' '}
            ({lpcProvider.attribution.license})
          </p>

          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4">
            <p className="mb-2 text-sm font-medium text-red-300">Zona de peligro</p>
            <p className="mb-3 text-[11px] text-ink-400">
              Elimina tu personaje y vuelve a empezar la creación desde cero. Tu progreso de misiones y metas no se
              borra.
            </p>
            <Button variant="outline" className="border-red-800 text-red-300" onClick={handleDeleteCharacter}>
              Eliminar personaje
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
