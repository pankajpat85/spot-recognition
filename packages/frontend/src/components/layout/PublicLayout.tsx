import { Link, NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0d1117_0%,_#0a0a0f_100%)]">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white font-bold text-sm">S</div>
            <span className="font-bold text-white text-lg">SpotRecognition</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
              <NavLink key={to} to={to} end className={({ isActive }) => cn('text-sm font-medium transition-colors', isActive ? 'text-accent-light' : 'text-white/70 hover:text-white')}>
                {label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-sm text-white/70 hover:text-white transition-colors">Login</Link>
            <Link to="/auth/register" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-light text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </nav>
      <main className="pt-16">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
        <p>© 2025 SpotRecognition. <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link></p>
      </footer>
    </div>
  )
}
