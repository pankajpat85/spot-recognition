import { motion } from 'framer-motion'
import { Star, Send, Users, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetSpotStatsQuery } from '@/store/api/spotsApi'
import { useAuth } from '@/hooks/useAuth'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }

export function DashboardPage() {
  const { user, org } = useAuth()
  const { data: stats, isLoading } = useGetSpotStatsQuery()

  const statCards = [
    { label: 'Total Spots Sent', value: stats?.totalSpots ?? 0, icon: Star, color: 'from-accent to-accent-light' },
    { label: 'Sent This Month', value: stats?.sentThisMonth ?? 0, icon: Send, color: 'from-blue-500 to-cyan-400' },
  ]

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <motion.div variants={fadeUp}>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-white/50">{org?.name} · {org?.plan} plan</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} variants={fadeUp} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-1">{isLoading ? '—' : value}</div>
              <div className="text-white/50 text-sm">{label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-8 p-6 rounded-2xl border border-accent/30 bg-accent/10">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/app/spots/new" className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-light text-white text-sm font-medium hover:opacity-90 transition-opacity">
              + Send Spot Recognition
            </Link>
            <Link to="/app/users" className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Manage Users
            </Link>
            <Link to="/app/history" className="px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              View History
            </Link>
          </div>
        </motion.div>

        {(stats?.recentSpots?.length ?? 0) > 0 && (
          <motion.div variants={fadeUp} className="mt-8">
            <h2 className="text-white font-semibold mb-4">Recent Spots</h2>
            <div className="space-y-3">
              {stats?.recentSpots?.slice(0, 5).map(spot => (
                <div key={spot.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="w-2 h-2 rounded-full bg-accent-light shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">
                      {spot.winners.map(w => w.user?.name ?? w.freeTextName).join(', ')}
                    </div>
                    <div className="text-white/40 text-xs">{new Date(spot.createdAt).toLocaleDateString()}</div>
                  </div>
                  {spot.sentAt && <span className="text-accent-light text-xs shrink-0">Sent</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
