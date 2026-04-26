import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useCreateSpotMutation, useUploadSpotImageMutation, useSendSpotMutation } from '@/store/api/spotsApi'
import { useGetBackgroundsQuery } from '@/store/api/backgroundsApi'
import { useGetBadgesQuery } from '@/store/api/badgesApi'
import { useAuth } from '@/hooks/useAuth'
import { useImageGenerator } from '@/hooks/useImageGenerator'
import { UserAutocomplete } from '@/components/spots/UserAutocomplete'
import { BadgeMultiSelect } from '@/components/spots/BadgeMultiSelect'
import { BackgroundPicker } from '@/components/spots/BackgroundPicker'
import { WallOfFame } from '@/components/spots/WallOfFame'
import { spotFormSchema, type SpotFormValues, type Participant } from '@/lib/zod-schemas'

export function SpotFormPage() {
  const navigate = useNavigate()
  const { org } = useAuth()
  const [step, setStep] = useState<'form' | 'generating' | 'done'>('form')
  const [statusMsg, setStatusMsg] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { wallOfFameRef, generate } = useImageGenerator()
  const [createSpot] = useCreateSpotMutation()
  const [uploadImage] = useUploadSpotImageMutation()
  const [sendSpot] = useSendSpotMutation()
  const { data: backgrounds = [] } = useGetBackgroundsQuery()
  const { data: badges = [] } = useGetBadgesQuery()

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<SpotFormValues>({
    resolver: zodResolver(spotFormSchema),
    defaultValues: { winners: [], senders: [], badges: [], description: '', startDate: '', endDate: '', backgroundId: backgrounds[0]?.id },
  })

  const watchedValues = watch()
  const selectedBackground = backgrounds.find(b => b.id === watchedValues.backgroundId) ?? backgrounds[0]
  const selectedBadges = badges.filter(b => watchedValues.badges.includes(b.value))

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleFirstWinner = (user: { name: string; photoUrl?: string | null }) => {
    if (user.photoUrl) setPhotoPreview(user.photoUrl)
  }

  const onSubmit = async (data: SpotFormValues) => {
    try {
      setStep('generating')

      setStatusMsg('Creating spot recognition...')
      const spot = await createSpot({
        winners: data.winners.map(w => w.type === 'user' ? { type: 'user', userId: w.userId } : { type: 'freeText', name: w.name, email: w.email }),
        senders: data.senders.map(s => s.type === 'user' ? { type: 'user', userId: s.userId } : { type: 'freeText', name: s.name, email: s.email }),
        badges: data.badges,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        backgroundId: data.backgroundId,
      }).unwrap()

      setStatusMsg('Generating Wall of Fame image...')
      // Small delay to ensure WallOfFame has rendered with latest props
      await new Promise(r => requestAnimationFrame(r))
      await new Promise(r => setTimeout(r, 300))

      const blob = await generate()

      setStatusMsg('Uploading image...')
      const form = new FormData()
      form.append('image', blob, 'wall-of-fame.png')
      await uploadImage({ id: spot.id, form }).unwrap()

      setStatusMsg('Sending emails...')
      await sendSpot(spot.id).unwrap()

      setStep('done')
      setTimeout(() => navigate('/app/history'), 1500)
    } catch (err) {
      setStep('form')
      alert((err as { data?: { error?: string } })?.data?.error ?? 'Something went wrong')
    }
  }

  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-white/60 text-lg">{statusMsg}</p>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-3xl">🏆</div>
        <h2 className="text-2xl font-bold text-white">Spot sent!</h2>
        <p className="text-white/50">Redirecting to history...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Send Spot Recognition</h1>
        <p className="text-white/50">Celebrate a teammate's outstanding contribution</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Winners */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-5">
          <h2 className="text-white font-semibold">Recognition Details</h2>

          <Controller
            name="winners"
            control={control}
            render={({ field }) => (
              <UserAutocomplete
                label="Spot Winner(s)"
                value={field.value as Participant[]}
                onChange={field.onChange}
                onFirstUserSelected={handleFirstWinner}
              />
            )}
          />
          {errors.winners && <p className="text-red-400 text-xs -mt-3">{errors.winners.message}</p>}

          {/* Photo */}
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Winner Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Winner photo" className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-white/30" />
                )}
              </div>
              <button type="button" onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:bg-white/5 transition-colors">
                <Upload className="w-4 h-4" />
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-white/60 mb-1.5 block">Recognition Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea {...field} rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  placeholder="Describe why this person deserves recognition..." />
              )}
            />
            {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
          </div>

          {/* Sender */}
          <Controller
            name="senders"
            control={control}
            render={({ field }) => (
              <UserAutocomplete
                label="Recognition Given By"
                value={field.value as Participant[]}
                onChange={field.onChange}
              />
            )}
          />
          {errors.senders && <p className="text-red-400 text-xs -mt-3">{errors.senders.message}</p>}
        </div>

        {/* Badges */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-white font-semibold">Achievement Badges</h2>
          <Controller
            name="badges"
            control={control}
            render={({ field }) => (
              <BadgeMultiSelect value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.badges && <p className="text-red-400 text-xs">{errors.badges.message}</p>}
        </div>

        {/* Date range */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-white font-semibold">Recognition Period</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">Start Date</label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <input type="date" {...field}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50 transition-colors [color-scheme:dark]" />
                )}
              />
              {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1.5 block">End Date</label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <input type="date" {...field}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50 transition-colors [color-scheme:dark]" />
                )}
              />
              {errors.endDate && <p className="text-red-400 text-xs">{errors.endDate.message}</p>}
            </div>
          </div>
        </div>

        {/* Background picker */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
          <h2 className="text-white font-semibold">Wall of Fame Background</h2>
          <Controller
            name="backgroundId"
            control={control}
            render={({ field }) => (
              <BackgroundPicker value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <button type="submit"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-accent/30">
          🏆 Send Spot Recognition
        </button>
      </form>

      {/* Hidden WallOfFame DOM for html2canvas */}
      <WallOfFame
        ref={wallOfFameRef}
        winners={watchedValues.winners.map(w => ({ ...w, photoUrl: w.type === 'user' && photoPreview ? photoPreview : null }))}
        senders={watchedValues.senders}
        description={watchedValues.description}
        startDate={watchedValues.startDate}
        endDate={watchedValues.endDate}
        badges={selectedBadges}
        background={selectedBackground}
        orgName={org?.name ?? ''}
      />
    </div>
  )
}
