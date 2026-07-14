import type { Achievement } from '@/types'

export const achievements: Achievement[] = [
  {
    id: 'first-mission',
    name: 'Primer paso',
    description: 'Completa tu primera misión.',
    icon: '🥾',
    isUnlocked: (ctx) => ctx.missionsCompleted >= 1,
  },
  {
    id: 'ten-missions',
    name: 'En marcha',
    description: 'Completa 10 misiones.',
    icon: '⚔️',
    isUnlocked: (ctx) => ctx.missionsCompleted >= 10,
  },
  {
    id: 'hundred-missions',
    name: 'Veterano',
    description: 'Completa 100 misiones.',
    icon: '🏆',
    isUnlocked: (ctx) => ctx.missionsCompleted >= 100,
  },
  {
    id: 'streak-30',
    name: 'Constancia',
    description: 'Alcanza una racha de 30 días.',
    icon: '🔥',
    isUnlocked: (ctx) => ctx.streakDays >= 30,
  },
  {
    id: 'hours-100',
    name: 'Cien horas',
    description: 'Invierte 100 horas en tu aventura.',
    icon: '⏳',
    isUnlocked: (ctx) => ctx.hoursInvested >= 100,
  },
  {
    id: 'level-10',
    name: 'Nivel 10',
    description: 'Alcanza el nivel 10.',
    icon: '⭐',
    isUnlocked: (ctx) => ctx.level >= 10,
  },
]
