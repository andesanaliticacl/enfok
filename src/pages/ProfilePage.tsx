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
      <div className="flex items-start gap-2">
        <div className="flex flex-1 flex-col gap-2">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-2.5">
                <p className="text-[9px] leading-tight text-ink-400">{stat.label}</p>
                <p className="text-sm font-semibold text-ink-50">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <header className="flex w-[44%] max-w-[230px] flex-shrink-0 flex-col items-center text-center">
          <div
            className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-ink-700"
            style={{
              backgroundImage: biomeArt ? `url(${biomeArt})` : undefined,
              backgroundColor: biome?.color ?? 'var(--color-ink-800)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              imageRendering: 'pixelated',
            }}
          >
            <AvatarSprite config={avatar} size={168} />
          </div>
          <h1 className="mt-3 text-base font-semibold text-ink-50">{profile.name}</h1>
          <p className="font-pixel text-[10px] text-gold-400">Nivel {profile.level}</p>
          {biome && (
            <p className="mt-1 text-[10px] text-ink-400">
              {biome.emoji} {biome.name}
            </p>
          )}

          <div className="mt-4 flex w-full flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/personaje/editar')} className="w-full">
              <Pencil size={14} /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/personaje/bioma')} className="w-full">
              <Globe2 size={14} /> Bioma
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)} className="w-full">
              <Settings size={14} /> Ajustes
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-2">
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
                  'flex items-center gap-1.5 rounded-xl border border-ink-700 bg-ink-900 px-2 py-2',
                  !unlocked && 'opacity-30',
                )}
                title={achievement.description}
              >
                <span className="text-base leading-none">{achievement.icon}</span>
                <span className="text-[9px] leading-tight text-ink-200">{achievement.name}</span>
              </div>
            )
          })}
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
