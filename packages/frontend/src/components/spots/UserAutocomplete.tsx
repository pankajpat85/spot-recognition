import { useState, useRef, useEffect } from 'react'
import { X, Plus, User } from 'lucide-react'
import { useGetUsersQuery } from '@/store/api/usersApi'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import type { Participant } from '@/lib/zod-schemas'

interface Props {
  label: string
  value: Participant[]
  onChange: (participants: Participant[]) => void
  onFirstUserSelected?: (user: { name: string; photoUrl?: string | null }) => void
}

interface FreeTextFormState { name: string; email: string }

export function UserAutocomplete({ label, value, onChange, onFirstUserSelected }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [freeTextMode, setFreeTextMode] = useState(false)
  const [freeForm, setFreeForm] = useState<FreeTextFormState>({ name: '', email: '' })
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useGetUsersQuery(
    { search: debouncedQuery, limit: 8 },
    { skip: !debouncedQuery }
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setFreeTextMode(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const addParticipant = (p: Participant) => {
    if (value.some(v => (v.type === 'user' && p.type === 'user' && v.userId === p.userId) || (v.type === 'freeText' && p.type === 'freeText' && v.email === p.email))) return
    const next = [...value, p]
    onChange(next)
    if (next.length === 1 && p.type === 'user' && onFirstUserSelected) {
      onFirstUserSelected({ name: p.name, photoUrl: (p as Participant & { photoUrl?: string | null }).photoUrl })
    }
    setQuery('')
    setOpen(false)
    setFreeTextMode(false)
    inputRef.current?.focus()
  }

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  const confirmFreeText = () => {
    if (!freeForm.name || !freeForm.email) return
    addParticipant({ type: 'freeText', name: freeForm.name, email: freeForm.email })
    setFreeForm({ name: '', email: '' })
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="text-sm text-white/60 mb-1.5 block">{label}</label>

      <div className="min-h-[46px] px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:border-accent/50 transition-colors">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {value.map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/30 text-accent-light text-xs">
              {p.name}
              {p.type === 'freeText' && <span className="text-white/40">({p.email})</span>}
              <button type="button" onClick={() => remove(i)} className="ml-0.5 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setFreeTextMode(false) }}
          onFocus={() => query && setOpen(true)}
          className="w-full bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
          placeholder={value.length ? 'Add another...' : 'Search or type a name...'}
        />
      </div>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border border-white/10 bg-black/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {isFetching && <div className="px-4 py-3 text-white/40 text-sm">Searching...</div>}

          {!isFetching && data?.users?.map(user => (
            <button key={user.id} type="button" onMouseDown={() => addParticipant({ type: 'user', userId: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl })}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left">
              <div className="w-7 h-7 rounded-full bg-accent/30 flex items-center justify-center text-accent-light text-xs font-semibold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="text-white text-sm">{user.name}</div>
                <div className="text-white/40 text-xs">{user.email}</div>
              </div>
            </button>
          ))}

          {!isFetching && !freeTextMode && query && (
            <button type="button" onMouseDown={() => { setFreeTextMode(true); setFreeForm({ name: query, email: '' }); setOpen(false) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/10 transition-colors text-left border-t border-white/10 text-white/60 text-sm">
              <Plus className="w-4 h-4" /> Add "{query}" as new person →
            </button>
          )}

          {!isFetching && !query && <div className="px-4 py-3 text-white/30 text-sm">Type to search users...</div>}
        </div>
      )}

      {freeTextMode && (
        <div className="mt-2 p-4 rounded-xl border border-accent/30 bg-accent/5">
          <p className="text-white/60 text-xs mb-3">Enter details for the new person:</p>
          <div className="flex gap-2">
            <input value={freeForm.name} onChange={e => setFreeForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50"
              placeholder="Full name" />
            <input type="email" value={freeForm.email} onChange={e => setFreeForm(f => ({ ...f, email: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent/50"
              placeholder="Email address" />
            <button type="button" onClick={confirmFreeText}
              className="px-3 py-2 rounded-lg bg-accent text-white text-sm hover:bg-accent-dark transition-colors">Add</button>
            <button type="button" onClick={() => setFreeTextMode(false)}
              className="px-3 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:bg-white/5 transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
