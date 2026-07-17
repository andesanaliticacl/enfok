import type { MissionRepeat, Priority, RegionCategory } from '@/types'

export interface PlanMissionBlueprint {
  title: string
  description: string
  repeat: MissionRepeat
  priority: Priority
  xp: number
  coins: number
  estimatedMinutes?: number
  time?: string
  tags: string[]
  /** Days after the plan's start date for the (first) occurrence. */
  startOffsetDays: number
}

export interface PlanTemplate {
  id: string
  name: string
  icon: string
  color: string
  description: string
  durationWeeks: number
  /** Which kind of region this plan fits naturally — just a suggestion in the picker. */
  suggestedCategory: RegionCategory
  xpReward: number
  reward: string
  missions: PlanMissionBlueprint[]
}

/**
 * Express plans: 3-month (12-week) programs that turn a life change into a goal
 * plus its missions in one tap — like a training plan, but for anything.
 * The repeating missions carry the habit; the one-offs are its milestones.
 */
export const PLANS: PlanTemplate[] = [
  {
    id: 'plan-invertir',
    name: 'Hábito de invertir',
    icon: '💹',
    color: '#d4af37',
    description: 'Tres meses para pasar de "algún día" a invertir todos los meses con criterio.',
    durationWeeks: 12,
    suggestedCategory: 'banco',
    xpReward: 300,
    reward: 'Tu primer portafolio en marcha',
    missions: [
      { title: 'Definir presupuesto y monto mensual', description: 'Cuánto puedes invertir sin tocar gastos fijos ni fondo de emergencia.', repeat: 'ninguna', priority: 'alta', xp: 30, coins: 8, estimatedMinutes: 45, tags: ['finanzas'], startOffsetDays: 0 },
      { title: 'Abrir cuenta de inversión', description: 'Elegir corredor o plataforma y dejar la cuenta operativa.', repeat: 'ninguna', priority: 'alta', xp: 40, coins: 10, estimatedMinutes: 60, tags: ['finanzas'], startOffsetDays: 7 },
      { title: 'Aporte mensual de inversión', description: 'Transferir el monto definido, pase lo que pase.', repeat: 'mensual', priority: 'alta', xp: 40, coins: 10, estimatedMinutes: 10, tags: ['finanzas', 'hábito'], startOffsetDays: 14 },
      { title: 'Estudiar inversión 30 minutos', description: 'Un capítulo, artículo o video serio por semana.', repeat: 'semanal', priority: 'media', xp: 20, coins: 5, estimatedMinutes: 30, tags: ['finanzas', 'estudio'], startOffsetDays: 3 },
      { title: 'Revisar portafolio y registrar', description: 'Anotar cuánto llevas y cómo va — sin vender por pánico.', repeat: 'mensual', priority: 'media', xp: 20, coins: 5, estimatedMinutes: 20, tags: ['finanzas'], startOffsetDays: 30 },
    ],
  },
  {
    id: 'plan-keto',
    name: 'Hábito keto',
    icon: '🥑',
    color: '#4a9b6e',
    description: 'Doce semanas de alimentación baja en carbohidratos con compras y menús planificados.',
    durationWeeks: 12,
    suggestedCategory: 'casa',
    xpReward: 280,
    reward: 'Un cuerpo que corre con otra energía',
    missions: [
      { title: 'Limpiar la despensa', description: 'Sacar ultraprocesados y azúcar; anotar qué reemplazar.', repeat: 'ninguna', priority: 'alta', xp: 30, coins: 8, estimatedMinutes: 60, tags: ['keto'], startOffsetDays: 0 },
      { title: 'Planificar menú semanal', description: 'Definir las comidas de la semana antes de comprar.', repeat: 'semanal', priority: 'alta', xp: 20, coins: 5, estimatedMinutes: 30, tags: ['keto', 'planificación'], startOffsetDays: 1 },
      { title: 'Compra keto de la semana', description: 'Comprar solo lo que está en el menú.', repeat: 'semanal', priority: 'media', xp: 15, coins: 4, estimatedMinutes: 60, tags: ['keto'], startOffsetDays: 2 },
      { title: 'Registrar comidas del día', description: 'Foto o nota rápida de lo que comiste — honestidad primero.', repeat: 'diaria', priority: 'media', xp: 10, coins: 2, estimatedMinutes: 5, tags: ['keto', 'registro'], startOffsetDays: 2 },
      { title: 'Pesarse y medir avance', description: 'Mismo día, misma hora, misma pesa.', repeat: 'semanal', priority: 'baja', xp: 10, coins: 2, estimatedMinutes: 5, tags: ['keto', 'registro'], startOffsetDays: 7 },
    ],
  },
  {
    id: 'plan-entrenamiento',
    name: 'Hábito de entrenamiento',
    icon: '💪',
    color: '#d47a4a',
    description: 'Tres meses de fuerza 3 veces por semana más cardio suave, sin saltarse semanas.',
    durationWeeks: 12,
    suggestedCategory: 'gimnasio',
    xpReward: 320,
    reward: 'La rutina ya no se negocia',
    missions: [
      { title: 'Definir rutina y horarios', description: 'Elegir programa de fuerza y bloquear los días en el calendario.', repeat: 'ninguna', priority: 'alta', xp: 30, coins: 8, estimatedMinutes: 45, tags: ['entrenamiento'], startOffsetDays: 0 },
      { title: 'Fuerza — día A', description: 'Primera sesión de fuerza de la semana.', repeat: 'semanal', priority: 'alta', xp: 30, coins: 6, estimatedMinutes: 60, tags: ['entrenamiento', 'fuerza'], startOffsetDays: 1 },
      { title: 'Fuerza — día B', description: 'Segunda sesión de fuerza de la semana.', repeat: 'semanal', priority: 'alta', xp: 30, coins: 6, estimatedMinutes: 60, tags: ['entrenamiento', 'fuerza'], startOffsetDays: 3 },
      { title: 'Fuerza — día C', description: 'Tercera sesión de fuerza de la semana.', repeat: 'semanal', priority: 'alta', xp: 30, coins: 6, estimatedMinutes: 60, tags: ['entrenamiento', 'fuerza'], startOffsetDays: 5 },
      { title: 'Cardio suave 25 minutos', description: 'Trote, bici o caminata rápida para recuperar.', repeat: 'semanal', priority: 'media', xp: 15, coins: 3, estimatedMinutes: 25, tags: ['entrenamiento', 'cardio'], startOffsetDays: 6 },
    ],
  },
  {
    id: 'plan-proyecto',
    name: 'Lograr un proyecto',
    icon: '🚀',
    color: '#4a7fd4',
    description: 'De idea a proyecto publicado en 12 semanas, con hitos concretos y avance semanal.',
    durationWeeks: 12,
    suggestedCategory: 'trabajo',
    xpReward: 350,
    reward: 'Algo tuyo, terminado y afuera',
    missions: [
      { title: 'Definir alcance del proyecto', description: 'Qué es, para quién, y qué queda explícitamente fuera.', repeat: 'ninguna', priority: 'alta', xp: 30, coins: 8, estimatedMinutes: 60, tags: ['proyecto'], startOffsetDays: 0 },
      { title: 'Sesión de avance semanal', description: 'Mínimo dos horas de trabajo enfocado en el proyecto.', repeat: 'semanal', priority: 'alta', xp: 30, coins: 6, estimatedMinutes: 120, tags: ['proyecto', 'foco'], startOffsetDays: 2 },
      { title: 'Primer prototipo funcionando', description: 'Feo pero real: algo que ya se pueda mostrar.', repeat: 'ninguna', priority: 'alta', xp: 50, coins: 12, estimatedMinutes: 120, tags: ['proyecto', 'hito'], startOffsetDays: 21 },
      { title: 'Feedback de 3 personas', description: 'Mostrarlo y anotar qué entendieron y qué no.', repeat: 'ninguna', priority: 'media', xp: 30, coins: 8, estimatedMinutes: 60, tags: ['proyecto', 'hito'], startOffsetDays: 42 },
      { title: 'Versión final lista', description: 'Cerrar los pendientes que de verdad importan.', repeat: 'ninguna', priority: 'alta', xp: 50, coins: 12, estimatedMinutes: 180, tags: ['proyecto', 'hito'], startOffsetDays: 70 },
      { title: 'Publicar el proyecto', description: 'Subirlo, compartirlo y contarlo.', repeat: 'ninguna', priority: 'alta', xp: 60, coins: 15, estimatedMinutes: 60, tags: ['proyecto', 'hito'], startOffsetDays: 84 },
    ],
  },
  {
    id: 'plan-habilidad',
    name: 'Aprender una habilidad',
    icon: '🎯',
    color: '#8a5fc9',
    description: 'Práctica deliberada diaria durante 12 semanas hasta poder demostrar la habilidad.',
    durationWeeks: 12,
    suggestedCategory: 'universidad',
    xpReward: 300,
    reward: 'Una habilidad nueva demostrable',
    missions: [
      { title: 'Elegir habilidad y recursos', description: 'Una sola habilidad, un curso o libro guía, y cómo medir avance.', repeat: 'ninguna', priority: 'alta', xp: 30, coins: 8, estimatedMinutes: 60, tags: ['aprendizaje'], startOffsetDays: 0 },
      { title: 'Práctica deliberada 30 minutos', description: 'Practicar lo difícil, no repetir lo cómodo.', repeat: 'diaria', priority: 'alta', xp: 15, coins: 3, estimatedMinutes: 30, tags: ['aprendizaje', 'práctica'], startOffsetDays: 1 },
      { title: 'Clase o curso semanal', description: 'Avanzar en el material guía de la semana.', repeat: 'semanal', priority: 'media', xp: 20, coins: 5, estimatedMinutes: 60, tags: ['aprendizaje', 'estudio'], startOffsetDays: 4 },
      { title: 'Evaluación de mitad de camino', description: 'Grabar o registrar dónde estás versus la semana 1.', repeat: 'ninguna', priority: 'media', xp: 30, coins: 8, estimatedMinutes: 45, tags: ['aprendizaje', 'hito'], startOffsetDays: 42 },
      { title: 'Proyecto de demostración', description: 'Algo concreto que pruebe la habilidad aprendida.', repeat: 'ninguna', priority: 'alta', xp: 50, coins: 12, estimatedMinutes: 120, tags: ['aprendizaje', 'hito'], startOffsetDays: 84 },
    ],
  },
]

export function planById(planId: string): PlanTemplate | undefined {
  return PLANS.find((p) => p.id === planId)
}
