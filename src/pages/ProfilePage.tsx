import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Pencil, Globe2, Map, Swords, Star, Sparkles, Coins, Flame, Hourglass, Trophy } from 'lucide-react'
import { useGameStore } from '@/store/useGameStore'
import { countCompletions } from '@/lib/planning/missionEngine'
import {
  DAILY_GOAL_PRESETS,
  dailyXpGoal,
  effectiveStreak,
  rankForLevel,
  streakAtRisk,
  xpEarnedToday,
} from '@/lib/planning/profileEngine'
import { addDaysToKey, todayKey } from '@/lib/calendar'
import { useAvatarStore } from '@/store/useAvatarStore'
import { useAuthStore } from '@/store/useAuthStore'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { BiomaComponent } from '@/components/biome/BiomaComponent'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import { biomes } from '@/data/biomes'
import { achievements } from '@/data/achievements'
import { PlansSection } from '@/components/planning/PlansSection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const WEEKDAY_LETTER = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

export function ProfilePage() {
  const navigate = useNavigate()
  const profile = useGameStore((s) => s.profile)
  const missions = useGameStore((s) => s.missions)
  const activityLog = useGameStore((s) => s.activityLog)
  const setDailyXpGoal = useGameStore((s) => s.setDailyXpGoal)
  const { avatar, biome: biomeId, biomeArt, biomeVariant, deleteCharacter } = useAvatarStore()
  const { user, signOut } = useAuthStore()

  const [settingsOpen, setSettingsOpen] = useState(false)

  const biome = biomes.find((b) => b.id === biomeId)
  // Repeating missions count every completed occurrence, not just their status.
  const missionsCompleted = useMemo(() => countCompletions(missions), [missions])
  const today = todayKey()
  const streak = effectiveStreak(profile, today)
  const atRisk = streakAtRisk(profile, today)
  const xpGoal = dailyXpGoal(profile)
  const xpProgress = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100))
  const rank = rankForLevel(profile.level)

  // Last 7 days, oldest first, for the Duolingo-style weekly strip.
  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const key = addDaysToKey(today, i - 6)
        const [y, m, d] = key.split('-').map(Number)
        const entry = activityLog[key]
        return {
          key,
          letter: WEEKDAY_LETTER[new Date(y, m - 1, d).getDay()],
          xp: entry?.xp ?? 0,
          missions: entry?.missions ?? 0,
          isToday: key === today,
        }
      }),
    [activityLog, today],
  )

  const achievementCtx = {
    missionsCompleted,
    streakDays: streak,
    hoursInvested: profile.hoursInvested,
    level: profile.level,
  }
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked(achievementCtx)).length

  const stats = [
    { label: 'Nivel', value: profile.level, icon: Star },
    { label: 'XP', value: profile.xp, icon: Sparkles },
    { label: 'Monedas', value: profile.coins, icon: Coins },
    { label: 'Racha', value: `${streak}d`, icon: Flame },
    { label: 'Horas', value: Math.round(profile.hoursInvested), icon: Hourglass },
    { label: 'Logros', value: `${unlockedAchievements}/${achievements.length}`, icon: Trophy },
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
          {/* Duolingo-style week: one dot per day, lit when the daily XP goal was met */}
          <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wide text-ink-400">Esta semana</h2>
              <p className="font-pixel text-[9px] text-gold-400">
                {xpEarnedToday(profile, today)}/{xpGoal} XP hoy
              </p>
            </div>
            <div className="flex justify-between gap-1">
              {week.map((day) => {
                const goalMet = day.xp >= xpGoal
                const active = day.xp > 0
                return (
                  <div key={day.key} className="flex flex-1 flex-col items-center gap-1" title={`${day.xp} XP · ${day.missions} misión(es)`}>
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border text-[10px]',
                        goalMet
                          ? 'border-gold-400 bg-gold-500/20 text-gold-400'
                          : active
                            ? 'border-ink-500 bg-ink-800 text-ink-200'
                            : 'border-ink-700 text-ink-600',
                        day.isToday && 'ring-2 ring-gold-400/40',
                      )}
                    >
                      {goalMet ? <Flame size={13} fill="currentColor" /> : active ? '✓' : ''}
                    </div>
                    <span className={cn('text-[9px]', day.isToday ? 'text-gold-400' : 'text-ink-500')}>{day.letter}</span>
                  </div>
                )
              })}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-ink-400">
              {atRisk
                ? `🔥 Racha de ${streak} días en riesgo — completa una misión hoy.`
                : streak > 0
                  ? `Racha viva: ${streak} día${streak === 1 ? '' : 's'} seguidos.`
                  : 'Completa una misión para encender tu racha.'}
            </p>
          </section>

          <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/60 p-4">
            <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Estadísticas</h2>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="flex flex-col items-center gap-1 p-3 text-center">
                    <stat.icon size={16} className="text-gold-400" />
                    <p
                      className={cn('text-sm font-semibold text-ink-50', (stat.label === 'Nivel' || stat.label === 'XP') && 'text-glow-gold')}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[9px] leading-tight text-ink-400">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <div className="order-1 flex flex-col lg:order-2">
          {/* Hero: the character is the centerpiece, staged on its living biome */}
          <BiomaComponent
            biomeId={biomeId}
            variant={biomeVariant}
            customArt={biomeArt}
            className="min-h-[360px] rounded-3xl border border-ink-700 panel-bevel lg:min-h-[460px]"
          >
            <div className="relative flex h-full flex-col items-center justify-center pb-2 pt-6">
              {/* Streak flame lives on the hero — it's the heartbeat of the game */}
              <div
                className={cn(
                  'absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1',
                  streak > 0 && !atRisk ? 'text-gold-400' : atRisk ? 'text-orange-400' : 'text-ink-500',
                )}
                title={atRisk ? 'Completa una misión hoy para no perder la racha' : 'Racha de días activos'}
              >
                <Flame size={14} fill={streak > 0 ? 'currentColor' : 'none'} />
                <span className="font-pixel text-[10px]">{streak}d</span>
              </div>

              <AvatarSprite config={avatar} size={192} />

              <div className="relative z-10 -mt-2 flex flex-col items-center gap-1 pb-5 text-center">
                <h1 className="text-lg font-semibold text-ink-50">{profile.name}</h1>
                <p className="font-pixel text-[10px] text-gold-400 text-glow-gold">
                  Nivel {profile.level} · {rank}
                </p>
                {biome && (
                  <p className="font-pixel text-[9px] text-ink-200">
                    {biome.emoji} {biome.name}
                  </p>
                )}

                <div className="mt-2 w-40">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-950/60">
                    <div
                      className="relative h-full overflow-hidden rounded-full bg-gold-400 shadow-[0_0_8px_2px_rgba(242,204,109,0.55)]"
                      style={{ width: `${xpProgress}%` }}
                    >
                      <div className="anim-shine absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                    </div>
                  </div>
                  <p className="mt-1 text-[9px] text-ink-300">
                    {profile.xp}/{profile.xpToNextLevel} XP
                  </p>
                </div>
              </div>
            </div>
          </BiomaComponent>

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
              className="panel-bevel flex flex-col items-start gap-2 rounded-2xl border border-ink-700 bg-ink-900 p-4 text-left transition-colors hover:border-gold-400"
            >
              <Map className="text-gold-400" size={22} />
              <span className="text-sm font-semibold text-ink-50">Mundo</span>
              <span className="text-[10px] text-ink-400">Explora tus regiones</span>
            </button>
            <button
              onClick={() => navigate('/misiones')}
              className="panel-bevel flex flex-col items-start gap-2 rounded-2xl border border-ink-700 bg-ink-900 p-4 text-left transition-colors hover:border-gold-400"
            >
              <Swords className="text-gold-400" size={22} />
              <span className="text-sm font-semibold text-ink-50">Misiones</span>
              <span className="text-[10px] text-ink-400">Tus tareas pendientes</span>
            </button>
          </div>
        </div>

        <div className="order-3 flex flex-col gap-6">
          <section className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/60 p-4">
            <h2 className="mb-2 text-xs uppercase tracking-wide text-ink-400">Logros</h2>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement) => {
                const unlocked = achievement.isUnlocked(achievementCtx)
                const prog = achievement.progress?.(achievementCtx)
                const pct = prog ? Math.min(100, Math.round((prog.current / prog.target) * 100)) : 0
                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      'panel-bevel flex flex-col items-center gap-1 rounded-xl border border-ink-700 bg-ink-900 p-3 text-center',
                      !unlocked && 'opacity-60',
                    )}
                    title={`${achievement.description}${prog && !unlocked ? ` (${Math.min(prog.current, prog.target)}/${prog.target})` : ''}`}
                  >
                    <span className={cn('text-2xl', !unlocked && 'grayscale opacity-60')}>{achievement.icon}</span>
                    <span className="text-[10px] text-ink-200">{achievement.name}</span>
                    {/* Seeing "7/10" is what turns a locked badge into a goal */}
                    {!unlocked && prog && (
                      <>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-ink-800">
                          <div className="h-full rounded-full bg-gold-500/70" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[8px] text-ink-500">
                          {Math.min(prog.current, prog.target)}/{prog.target}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <PlansSection />
        </div>
      </div>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Configuración">
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-ink-700 bg-ink-800 p-4">
            <p className="mb-1 text-sm font-medium text-ink-50">Meta diaria de XP</p>
            <p className="mb-3 text-[11px] text-ink-400">Cuánta XP quieres ganar cada día para mantener el ritmo.</p>
            <div className="grid grid-cols-3 gap-2">
              {DAILY_GOAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setDailyXpGoal(preset.xp)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-xl border border-ink-600 bg-ink-900 p-2.5',
                    xpGoal === preset.xp && 'border-gold-400',
                  )}
                >
                  <span className={cn('text-xs font-medium', xpGoal === preset.xp ? 'text-gold-400' : 'text-ink-200')}>
                    {preset.label}
                  </span>
                  <span className="text-[10px] text-ink-400">{preset.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {isSupabaseConfigured && user && (
            <div className="rounded-xl border border-ink-700 bg-ink-800 p-4">
              <p className="mb-1 text-[11px] text-ink-400">Sesión iniciada como</p>
              <p className="mb-3 text-sm font-medium text-ink-50">{user.email}</p>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Cerrar sesión
              </Button>
            </div>
          )}

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
