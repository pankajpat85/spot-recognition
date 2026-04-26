import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { useGetBadgesQuery } from '@/store/api/badgesApi'
import { cn } from '@/lib/cn'

interface Props {
  value: string[]
  onChange: (badges: string[]) => void
}

export function BadgeMultiSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const { data: badges = [] } = useGetBadgesQuery()

  const toggle = (badgeValue: string) => {
    onChange(value.includes(badgeValue) ? value.filter(v => v !== badgeValue) : [...value, badgeValue])
  }

  const selectedBadges = badges.filter(b => value.includes(b.value))

  return (
    <div>
      <label className="text-sm text-white/60 mb-1.5 block">Badges</label>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-accent/50 transition-colors text-left">
          <span className={cn('text-sm', value.length ? 'text-white' : 'text-white/30')}>
            {value.length ? `${value.length} badge${value.length > 1 ? 's' : ''} selected` : 'Select badges...'}
          </span>
          <ChevronDown className={cn('w-4 h-4 text-white/40 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl p-3 grid grid-cols-2 gap-2">
            {badges.map(badge => (
              <button key={badge.value} type="button" onClick={() => toggle(badge.value)}
                className={cn('flex items-center gap-2 p-2 rounded-lg transition-all text-left', value.includes(badge.value) ? 'bg-accent/20 border border-accent/40' : 'bg-white/5 border border-white/5 hover:bg-white/10')}>
                <img src={badge.imageUrl} alt={badge.label} className="w-8 h-8 object-contain" />
                <div>
                  <div className="text-white text-xs font-medium">{badge.label}</div>
                  {value.includes(badge.value) && <div className="text-accent-light text-xs">✓ Selected</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedBadges.map(badge => (
            <span key={badge.value} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent-light text-xs">
              <img src={badge.imageUrl} alt={badge.label} className="w-4 h-4 object-contain" />
              {badge.label}
              <button type="button" onClick={() => toggle(badge.value)} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
