export interface SystemTemplate {
  id: string
  name: string
  icon: string
  color: string
  /** Why this system exists — the payoff of not rebuilding it every time. */
  summary: string
  steps: string[]
  loops: boolean
}

/** Ready-made machines to start from — edit the steps, they're just a starting shape. */
export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    id: 'contenido',
    name: 'Sistema de contenido',
    icon: '🎬',
    color: '#d47a4a',
    summary: 'Una idea se convierte en piezas para todas las plataformas, sin rehacer nada desde cero.',
    steps: [
      'Idea',
      'Grabación',
      'Edición',
      'Publicación',
      'Reciclado',
      'Shorts',
      'Newsletter',
      'YouTube',
      'Instagram',
      'TikTok',
    ],
    loops: true,
  },
  {
    id: 'comercial',
    name: 'Sistema comercial',
    icon: '🤝',
    color: '#4a9b6e',
    summary: 'Del primer contacto al caso de éxito, y del caso de éxito a más clientes.',
    steps: [
      'Cliente llega',
      'Formulario',
      'Reunión',
      'Propuesta',
      'Contrato',
      'Desarrollo',
      'Entrega',
      'Caso de éxito',
      'Contenido',
      'Más clientes',
    ],
    loops: true,
  },
  {
    id: 'red-esperanza',
    name: 'Sistema Red de Esperanza',
    icon: '🆘',
    color: '#4a7fd4',
    summary: 'Cada emergencia atendida hace crecer la red que atenderá la siguiente.',
    steps: [
      'Emergencia',
      'Ciudadanos',
      'Rescatistas',
      'Municipios',
      'Medios',
      'Contenido',
      'Nuevos usuarios',
      'Más organizaciones',
    ],
    loops: true,
  },
]

export const SYSTEM_COLORS = ['#d47a4a', '#4a9b6e', '#4a7fd4', '#8a5fc9', '#d46a8a', '#4bb3c9', '#d4af37']

export const SYSTEM_ICONS = ['🧩', '🎬', '🤝', '🆘', '🚀', '📚', '🏗️', '🔁', '💡', '🎯']
