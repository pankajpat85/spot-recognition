import { cn } from '@/lib/cn'
import { useGetBackgroundsQuery, useCreateBackgroundMutation, type Background } from '@/store/api/backgroundsApi'
import { useSelector } from 'react-redux'
import { selectCurrentOrg } from '@/store/features/authSlice'

interface Props {
  value?: string
  onChange: (id: string) => void
}

export function BackgroundPicker({ value, onChange }: Props) {
  const { data: bgs = [] } = useGetBackgroundsQuery()
  const [createBg] = useCreateBackgroundMutation()
  const org = useSelector(selectCurrentOrg)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    form.append('name', file.name.replace(/\.[^.]+$/, ''))
    const newBg = await createBg(form).unwrap()
    onChange(newBg.id)
    e.target.value = ''
  }

  return (
    <div>
      <label className="text-sm text-white/60 mb-1.5 block">Spot Background</label>
      <div className="grid grid-cols-4 gap-2">
        {bgs.map(bg => (
          <button key={bg.id} type="button" onClick={() => onChange(bg.id)}
            className={cn('relative rounded-lg overflow-hidden aspect-video border-2 transition-all', value === bg.id ? 'border-accent shadow-lg shadow-accent/30' : 'border-white/10 hover:border-white/30')}>
            <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
            {value === bg.id && <div className="absolute inset-0 bg-accent/20 flex items-center justify-center"><span className="text-white text-xl">✓</span></div>}
          </button>
        ))}
        <label className={cn('cursor-pointer rounded-lg border-2 border-dashed border-white/20 aspect-video flex flex-col items-center justify-center text-white/30 hover:border-accent/50 hover:text-accent-light transition-all', org?.plan === 'FREE' && 'opacity-50 cursor-not-allowed')}>
          <span className="text-2xl mb-0.5">+</span>
          <span className="text-xs">{org?.plan === 'FREE' ? 'PRO' : 'Upload'}</span>
          {org?.plan !== 'FREE' && <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />}
        </label>
      </div>
    </div>
  )
}
