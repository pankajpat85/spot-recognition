import { forwardRef } from 'react'
import type { Participant } from '@/lib/zod-schemas'
import type { Background } from '@/store/api/backgroundsApi'
import type { Badge } from '@/store/api/badgesApi'

interface WallOfFameProps {
  winners: (Participant & { photoUrl?: string | null })[]
  senders: Participant[]
  description: string
  startDate: string
  endDate: string
  badges: Badge[]
  background?: Background
  orgName: string
  orgLogoUrl?: string | null
}

export const WallOfFame = forwardRef<HTMLDivElement, WallOfFameProps>(
  ({ winners, senders, description, startDate, endDate, badges, background, orgName, orgLogoUrl }, ref) => {
    const backgroundUrl = background?.imageUrl ?? '/static/backgrounds/default-background.png'

    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', width: '800px', minHeight: '500px' }}>
          {/* Background image */}
          <img
            src={backgroundUrl}
            crossOrigin="anonymous"
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          />

          <div style={{ position: 'relative', zIndex: 1, padding: '40px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', gap: '12px' }}>
              {orgLogoUrl && (
                <img src={orgLogoUrl} crossOrigin="anonymous" alt={orgName} style={{ height: '40px', objectFit: 'contain' }} />
              )}
              <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {orgLogoUrl ? 'Wall of Fame' : orgName + ' — Wall of Fame'}
              </h1>
            </div>

            {/* Date range */}
            {startDate && endDate && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '24px' }}>
                {new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} –{' '}
                {new Date(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}

            {/* Media objects */}
            {winners.map((winner, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                  gap: '20px',
                  marginBottom: '20px',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '2px solid #ffefab',
                }}
              >
                {/* Photo */}
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, backgroundColor: '#00a089', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {winner.photoUrl ? (
                    <img src={winner.photoUrl} crossOrigin="anonymous" alt={winner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#ffffff', fontSize: '36px', fontWeight: 700 }}>{winner.name.charAt(0)}</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#1a1a2e', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>{winner.name}</h3>
                  <p style={{ color: '#444', fontSize: '14px', margin: '0 0 8px', lineHeight: 1.6 }}>{description}</p>
                  <p style={{ color: '#00a089', fontSize: '13px', margin: '0 0 12px', fontStyle: 'italic' }}>
                    — {senders.map(s => s.name).join(', ')}
                  </p>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {badges.map(badge => (
                      <div key={badge.value} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: 'rgba(0,160,137,0.1)', borderRadius: '20px', border: '1px solid rgba(0,160,137,0.3)' }}>
                        <img src={badge.imageUrl} crossOrigin="anonymous" alt={badge.label} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        <span style={{ color: '#00a089', fontSize: '12px', fontWeight: 600 }}>{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

WallOfFame.displayName = 'WallOfFame'
