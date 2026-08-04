import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Map, Swords, Backpack, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/mundo', label: 'Mundo', icon: Map },
  { to: '/misiones', label: 'Misiones', icon: Swords },
  { to: '/inventario', label: 'Inventario', icon: Backpack },
  { to: '/perfil', label: 'Perfil', icon: User },
]

/**
 * The menu is the frame the whole game sits in, so it's treated like one: a dark
 * glass slab with a gold hairline, a single lit rune for where you are, and a
 * glow that slides between tabs instead of blinking on. Nothing else moves —
 * the restraint is what keeps it feeling expensive rather than busy.
 */
export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      {/* Gold hairline: one crisp line reads as inlay, a thick border reads as a box */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-500/45 to-transparent" />

      <div className="border-t border-ink-800/80 bg-ink-950/85 backdrop-blur-xl">
        <ul className="relative mx-auto flex max-w-xl items-stretch justify-between px-3 py-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to || (to === '/perfil' && pathname === '/')

            return (
              <li key={to} className="flex-1">
                <NavLink to={to} className="relative flex flex-col items-center gap-1 rounded-xl px-1 py-2">
                  {/* One shared highlight that travels between tabs */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-x-1 inset-y-0 rounded-xl border border-gold-500/30 bg-gradient-to-b from-gold-500/16 to-transparent"
                    />
                  )}

                  <span className="relative flex h-6 items-center justify-center">
                    {/* Halo behind the lit rune */}
                    {isActive && (
                      <motion.span
                        layoutId="nav-halo"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute h-8 w-8 rounded-full bg-gold-400/18 blur-[6px]"
                      />
                    )}
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.2 : 1.75}
                      className={cn(
                        'relative transition-colors duration-200',
                        isActive ? 'text-gold-400' : 'text-ink-500',
                      )}
                      style={isActive ? { filter: 'drop-shadow(0 0 5px rgba(242,204,109,0.55))' } : undefined}
                    />
                  </span>

                  <span
                    className={cn(
                      'relative font-pixel text-[7px] tracking-wider transition-colors duration-200',
                      isActive ? 'text-gold-400' : 'text-ink-500',
                    )}
                  >
                    {label.toUpperCase()}
                  </span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
