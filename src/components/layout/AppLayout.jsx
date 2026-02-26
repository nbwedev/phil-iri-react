import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, Users, LayoutDashboard } from 'lucide-react'
import { cn } from '../../utils/cn.js'

// Navigation items — add new routes here
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students',  label: 'Students',  icon: Users },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* ── Top Header ── */}
      <header className="bg-brand-800 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <BookOpen className="w-6 h-6 text-brand-100" />
        <div>
          <h1 className="text-sm font-semibold leading-tight">Phil-IRI Digital Admin</h1>
          <p className="text-xs text-brand-200 leading-tight">DepEd Reading Assessment Tool</p>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="flex-1 overflow-auto pb-20">
        {/* Outlet renders the current route's page component */}
        <Outlet />
      </main>

      {/* ── Bottom Navigation (tablet-friendly) ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-lg">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors min-h-tap',
              isActive
                ? 'text-brand-700 bg-brand-50'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
