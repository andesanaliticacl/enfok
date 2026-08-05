import type { LeadState, LeadType } from '@/types'

export interface LeadTypeDef {
  id: LeadType
  label: string
  icon: string
}

/** Los tipos de oportunidad que de verdad llegan por Instagram, WhatsApp o correo. */
export const LEAD_TYPES: LeadTypeDef[] = [
  { id: 'municipalidad', label: 'Municipalidad', icon: '🏛' },
  { id: 'empresa', label: 'Empresa', icon: '🏢' },
  { id: 'app', label: 'App', icon: '📱' },
  { id: 'web', label: 'Página web', icon: '🌐' },
  { id: 'ia', label: 'IA / Automatización', icon: '🤖' },
  { id: 'curso', label: 'Curso', icon: '🎓' },
  { id: 'colaboracion', label: 'Colaboración', icon: '🤝' },
  { id: 'sponsor', label: 'Sponsor', icon: '💰' },
  { id: 'ong', label: 'ONG', icon: '❤️' },
  { id: 'otro', label: 'Otro', icon: '✨' },
]

export function leadType(id: LeadType): LeadTypeDef {
  return LEAD_TYPES.find((t) => t.id === id) ?? LEAD_TYPES[LEAD_TYPES.length - 1]
}

export interface LeadStateDef {
  id: LeadState
  label: string
  dot: string
  color: string
  /** Cierra el embudo: ya no espera nada de ti. */
  closed?: boolean
}

/**
 * El estado es un semáforo, no un pipeline. Se lee de un vistazo y avanza en
 * orden, salvo "En espera" y "Perdido", que son salidas.
 */
export const LEAD_STATES: LeadStateDef[] = [
  { id: 'nuevo', label: 'Nuevo', dot: '🟡', color: '#d4af37' },
  { id: 'contactado', label: 'Contactado', dot: '🔵', color: '#4a7fd4' },
  { id: 'reunion', label: 'Reunión', dot: '🟣', color: '#8a5fc9' },
  { id: 'propuesta', label: 'Propuesta enviada', dot: '🟢', color: '#4a9b6e' },
  { id: 'cliente', label: 'Cliente', dot: '🟢', color: '#2f7a4f', closed: true },
  { id: 'espera', label: 'En espera', dot: '⚪', color: '#7a7a7a', closed: true },
  { id: 'perdido', label: 'Perdido', dot: '🔴', color: '#c9432f', closed: true },
]

export function leadState(id: LeadState): LeadStateDef {
  return LEAD_STATES.find((s) => s.id === id) ?? LEAD_STATES[0]
}

/** Pasados estos días sin contacto, una oportunidad viva empieza a enfriarse. */
export const LEAD_STALE_DAYS = 7
