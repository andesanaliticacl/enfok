import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Pencil, Globe2, Map, Swords, Star, Sparkles, Coins, Flame, Hourglass, Compass } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { useAvatarStore } from '@/store/useAvatarStore'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import { biomes, biomeBackgroundUrl } from '@/data/biomes'
import { achievements } from '@/data/achievements'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function ProfilePage() {
  const navigate = useNavigate()
  const profile = useGameStore((s) => s.profile)
  const regions = useGameStore((s) => s.regions)
  const goals = useGameStore((s) => s.goals)
  const missions = useGameStore((s) => s.missions)
  const inventory = useGameStore((s) => s.inventory)
  const { avatar, biome: biomeId, biomeArt, biomeVariant, deleteCharacter } = useAvatarStore()

  const [settingsOpen, setSettingsOpen] = useState(false)

  const unlockedRegions = regions.filter((r) => r.level > 0).length
  const biome = biomes.find((b) => b.id === biomeId)
  const missionsCompleted = useMemo(() => missions.filter((m) => m.status === 'completada').length, [missions])
  const xpProgress = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100))

  const stats = [
    { label: 'Nivel', value: profile.level, icon: Star },
    { label: 'XP', value: profile.xp, icon: Sparkles },
    { label: 'Monedas', value: profile.coins, icon: Coins },
    { label: 'Racha', value: `${profile.streakDays}d`, icon: Flame },
    { label: 'Horas', value: profile.hoursInvested, icon: Hourglass },
    { label: 'Regiones', value: `${unlockedRegions}/${regions.length}`, icon: Compass },
  ]

  function handleDeleteCharacter() {
    deleteCharacter()
    setSettingsOpen(false)
    navigate('/')
  }

  return (
    <div className="w-full px-4 pt-6 pb-4 md:px-10 xl:px-16">
      {/* On mobile everything stacks with the character on top; from lg up it spreads
          the full width of the screen into three columns with the character anchored dead-center. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Estadísticas</h2>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
                    <stat.icon size={16} className="text-gold-400" />
                    <p className="text-sm font-semibold text-ink-50">{stat.value}</p>
                    <p className="text-[9px] leading-tight text-ink-400">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="order-1 flex flex-col lg:order-2">
          {/* Hero: the character is the centerpiece, staged on its biome */}
          <div
            className="relative overflow-hidden rounded-3xl border border-ink-700"
            style={{
              backgroundImage: `url(${biomeArt || (biome ? biomeBackgroundUrl(biome.id, biomeVariant) : '')})`,
              backgroundColor: biome?.color ?? 'var(--color-ink-800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950/90" />

            <div className="relative flex flex-col items-center pt-6">
              <AvatarSprite config={avatar} size={192} />

              <div className="relative z-10 -mt-2 flex flex-col items-center gap-1 pb-5 text-center">
                <h1 className="text-lg font-semibold text-ink-50">{profile.name}</h1>
                <p className="font-pixel text-[10px] text-gold-400">Nivel {profile.level}</p>
                {biome && (
                  <p className="font-pixel text-[9px] text-ink-200">
                    {biome.emoji} {biome.name}
                  </p>
                )}

                <div className="mt-2 w-40">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-950/60">
                    <div className="h-full rounded-full bg-gold-400" style={{ width: `${xpProgress}%` }} />
                  </div>
                  <p className="mt-1 text-[9px] text-ink-300">
                    {profile.xp}/{profile.xpToNextLevel} XP
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/personaje/editar')}>
              <Pencil size={14} /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/personaje/bioma')}>
              <Globe2 size={14} /> Bioma
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings size={14} /> Ajustes
            </Button>
          </div>

          {/* Quick ways out of the profile, back into the game */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-start gap-2 rounded-2xl border border-ink-700 bg-ink-900 p-4 text-left transition-colors hover:border-gold-400"
            >
              <Map className="text-gold-400" size={22} />
              <span className="text-sm font-semibold text-ink-50">Mundo</span>
              <span className="text-[10px] text-ink-400">Explora tus regiones</span>
            </button>
            <button
              onClick={() => navigate('/misiones')}
              className="flex flex-col items-start gap-2 rounded-2xl border border-ink-700 bg-ink-900 p-4 text-left transition-colors hover:border-gold-400"
            >
              <Swords className="text-gold-400" size={22} />
              <span className="text-sm font-semibold text-ink-50">Misiones</span>
              <span className="text-[10px] text-ink-400">Tus tareas pendientes</span>
            </button>
          </div>
        </div>

        <div className="order-3 flex flex-col gap-6">
          <section>
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

          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Inventario</h2>
            <div className="grid grid-cols-2 gap-3">
              {inventory.map((item) => {
                const linkedGoals = item.linkedGoalIds.map((id) => goals.find((g) => g.id === id)).filter((g) => !!g)
                return (
                  <Card key={item.id}>
                    <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                      <span className="text-3xl">{item.icon}</span>
                      <p className="text-sm font-medium text-ink-50">{item.name}</p>
                      <p className="text-[11px] text-ink-400">
                        {linkedGoals.length > 0
                          ? linkedGoals.map((g) => `${g!.icon} ${g!.name}`).join(', ')
                          : 'Sin meta asociada'}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        </div>
      </div>

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
