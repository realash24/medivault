import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Pill, Activity, FlaskConical, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Medications', to: '/medications', icon: Pill },
  { label: 'Vitals', to: '/vitals', icon: Activity },
  { label: 'Pathology', to: '/pathology', icon: FlaskConical },
  { label: 'More', to: '/settings', icon: MoreHorizontal },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40 flex">
      {mobileItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center py-2 text-[10px] gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
