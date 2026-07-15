import { NavLink } from 'react-router-dom'
import { Map, Swords, Backpack, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: 'Mundo', icon: Map },
  { to: '/misiones', label: 'Misiones', icon: Swords },
  { to: '/inventario', label: 'Inventario', icon: Backpack },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-900/95 backdrop-blur">
      <ul className="mx-auto flex max-w-xl items-center justify-between px-2 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium text-ink-400 transition-colors',
                  isActive && 'text-gold-400',
                )
              }
            >
              <Icon size={20} strokeWidth={2} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
