import type { LifeSystem, StepDependency, SystemStep } from '@/types'

export interface DependencyDef {
  key: StepDependency
  label: string
  short: string
  color: string
  /** 0–1: cuánto corre sin ti. */
  weight: number
}

export const DEPENDENCIES: DependencyDef[] = [
  { key: 'mia', label: 'Depende totalmente de mí', short: 'Mío', color: '#c9432f', weight: 0 },
  { key: 'parcial', label: 'Parcialmente delegado', short: 'Parcial', color: '#d4af37', weight: 0.5 },
  { key: 'libre', label: 'Funciona sin mí', short: 'Libre', color: '#4a9b6e', weight: 1 },
]

export function dependencyDef(key: StepDependency): DependencyDef {
  return DEPENDENCIES.find((d) => d.key === key) ?? DEPENDENCIES[0]
}

export interface SystemHealth {
  /** 0–100. La única pregunta: ¿puede funcionar sin mí? */
  autonomy: number
  /** Frase honesta para ese nivel — nada de jerga. */
  verdict: string
  automated: number
  delegated: number
  total: number
  /** El primer paso que sigue dependiendo de ti: lo que frena todo lo demás. */
  bottleneck: SystemStep | null
}

/** Una frase que un fundador entendería en un segundo. */
function verdictFor(autonomy: number, total: number): string {
  if (total === 0) return 'Agrega pasos para saber cuánto depende de ti.'
  if (autonomy >= 85) return 'Corre solo. Tu trabajo aquí es revisar, no ejecutar.'
  if (autonomy >= 60) return 'Puede funcionar aunque no trabajes algunos días.'
  if (autonomy >= 30) return 'Aún depende bastante de ti.'
  return 'Sin ti, esto se detiene por completo.'
}

/**
 * Todo lo que la pantalla necesita saber, derivado de los pasos — no hay
 * métricas que el usuario tenga que mantener a mano.
 */
export function systemHealth(system: LifeSystem): SystemHealth {
  const total = system.steps.length
  if (total === 0) {
    return { autonomy: 0, verdict: verdictFor(0, 0), automated: 0, delegated: 0, total: 0, bottleneck: null }
  }

  // Un paso automatizado corre solo por definición, sin importar quién lo diseñó.
  const score = system.steps.reduce(
    (sum, step) => sum + (step.automated ? 1 : dependencyDef(step.dependency).weight),
    0,
  )

  return {
    autonomy: Math.round((score / total) * 100),
    verdict: verdictFor(Math.round((score / total) * 100), total),
    automated: system.steps.filter((s) => s.automated).length,
    delegated: system.steps.filter((s) => !s.automated && s.personId).length,
    total,
    // El cuello de botella es el primero que aún te espera a ti.
    bottleneck: system.steps.find((s) => !s.automated && s.dependency === 'mia') ?? null,
  }
}

/** Verde cuando ya casi corre solo, ámbar a medio camino, rojo cuando todo pasa por ti. */
export function autonomyColor(autonomy: number): string {
  if (autonomy >= 60) return '#4a9b6e'
  if (autonomy >= 30) return '#d4af37'
  return '#c9432f'
}
