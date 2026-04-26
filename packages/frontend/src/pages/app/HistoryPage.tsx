import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Send } from 'lucide-react'
import { useGetSpotsQuery, useSendSpotMutation, type Spot } from '@/store/api/spotsApi'

export function HistoryPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useGetSpotsQuery({ search: search || undefined })
  const [sendSpot] = useSendSpotMutation()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Recognition History</h1>
        <p className="text-white/50">All spot recognitions sent by your organization</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50" placeholder="Search by winner name..." />
        </div>
      </div>

      {isLoading ? (
        <div className="text-white/40 text-center py-16">Loading...</div>
      ) : !data?.spots?.length ? (
        <div className="text-center py-16 text-white/40">No spot recognitions found. <a href="/app/spots/new" className="text-accent-light hover:text-accent">Send one now →</a></div>
      ) : (
        <div className="space-y-3">
          {data.spots.map(spot => (
            <SpotCard key={spot.id} spot={spot} onResend={() => sendSpot(spot.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SpotCard({ spot, onResend }: { spot: Spot; onResend: () => void }) {
  const winners = spot.winners.map(w => w.user?.name ?? w.freeTextName).filter(Boolean).join(', ')
  const senders = spot.senders.map(s => s.user?.name ?? s.freeTextName).filter(Boolean).join(', ')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold mb-1 truncate">{winners}</div>
          <div className="text-white/50 text-sm mb-2">Given by {senders}</div>
          <p className="text-white/60 text-sm line-clamp-2 mb-3">{spot.description}</p>
          <div className="flex flex-wrap gap-2">
            {spot.badges.map(b => (
              <span key={b.id} className="px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-accent-light text-xs">{b.badgeValue.replace(/-/g, ' ')}</span>
            ))}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-white/40 text-xs mb-2">{new Date(spot.startDate).toLocaleDateString()} – {new Date(spot.endDate).toLocaleDateString()}</div>
          {spot.sentAt ? (
            <span className="text-accent-light text-xs">✓ Sent</span>
          ) : (
            <button onClick={onResend} className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors">
              <Send className="w-3 h-3" /> Send
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
