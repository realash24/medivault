import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, User, AlertCircle, Pill, Zap, Activity, FlaskConical,
  Syringe, Stethoscope, FileText, Calendar, Settings, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
}

const sections: { heading: string; items: NavItem[] }[] = [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }],
  },
  {
    heading: 'Clinical Data',
    items: [
      { label: 'Profile', to: '/profile', icon: User },
      { label: 'Problems', to: '/problems', icon: AlertCircle },
      { label: 'Medications', to: '/medications', icon: Pill },
      { label: 'Reactions', to: '/reactions', icon: Zap },
      { label: 'Vitals', to: '/vitals', icon: Activity },
    ],
  },
  {
    heading: 'Reports',
    items: [
      { label: 'Pathology', to: '/pathology', icon: FlaskConical },
      { label: 'Immunisations', to: '/immunisations', icon: Syringe },
      { label: 'Encounters', to: '/encounters', icon: Stethoscope },
      { label: 'Documents', to: '/documents', icon: FileText },
    ],
  },
  {
    heading: 'Tools',
    items: [
      { label: 'Calendar', to: '/calendar', icon: Calendar },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
}

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 space-y-6">
      {sections.map((section) => (
        <div key={section.heading}>
          {!collapsed && (
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {section.heading}
            </p>
          )}
          <ul className="space-y-0.5">
            {section.items.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-none transition-colors hover:bg-muted',
                      isActive ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-foreground/70'
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                  {!collapsed && <ChevronRight className="h-3 w-3 ml-auto opacity-40" />}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
