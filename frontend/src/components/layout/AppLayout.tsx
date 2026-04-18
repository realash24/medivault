import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { MobileNav } from './MobileNav'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-xs">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>
          <strong>Disclaimer:</strong> This application is for personal health record management only. It is not a substitute for professional medical advice, diagnosis, or treatment.
        </span>
      </div>

      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <aside
          className={cn(
            'hidden md:flex flex-col transition-all duration-200 border-r bg-background',
            sidebarOpen ? 'w-60' : 'w-16'
          )}
        >
          <Sidebar collapsed={!sidebarOpen} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
