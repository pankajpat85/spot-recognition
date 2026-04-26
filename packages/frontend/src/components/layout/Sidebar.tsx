import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Star, History, Users, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/spots/new', label: 'Spot Recognition', icon: Star },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/users', label: 'Users', icon: Users },
  { to: '/app/settings', label: 'Org Settings', icon: Settings },
]

export function Sidebar() {
  const { org, user, signOut } = useAuth()

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white font-bold text-sm">S</div>
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm truncate">{org?.name}</div>
          <div className="text-xs text-white/40 capitalize">{org?.plan?.toLowerCase()} plan</div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/app/dashboard'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-accent/20 text-accent-light border border-accent/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-accent-light font-semibold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-white/40 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  )
}
