import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useGetOrgQuery, useUpdateOrgMutation, useUpdateSmtpMutation, useTestSmtpMutation } from '@/store/api/orgApi'
import { useGetBackgroundsQuery, useCreateBackgroundMutation, useDeleteBackgroundMutation } from '@/store/api/backgroundsApi'

type Tab = 'general' | 'smtp' | 'backgrounds'

export function OrgSettingsPage() {
  const [tab, setTab] = useState<Tab>('general')
  const { data: org, isLoading } = useGetOrgQuery()

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'smtp', label: 'SMTP / Email' },
    { id: 'backgrounds', label: 'Backgrounds' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Organization Settings</h1>
        <p className="text-white/50">Configure your organization's profile and integrations</p>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-px">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? 'text-accent-light border-b-2 border-accent-light' : 'text-white/50 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? <div className="text-white/40 text-center py-16">Loading...</div> : (
        <div className="max-w-2xl">
          {tab === 'general' && org && <GeneralTab org={org} />}
          {tab === 'smtp' && <SmtpTab hasConfig={org?.hasSmtpConfig ?? false} />}
          {tab === 'backgrounds' && <BackgroundsTab />}
        </div>
      )}
    </div>
  )
}

function GeneralTab({ org }: { org: { name: string; fromEmail: string | null; fromName: string | null } }) {
  const [updateOrg, { isLoading }] = useUpdateOrgMutation()
  const { register, handleSubmit } = useForm({ defaultValues: { name: org.name, fromEmail: org.fromEmail ?? '', fromName: org.fromName ?? '' } })

  const onSubmit = async (data: Record<string, string>) => {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => form.append(k, v))
    await updateOrg(form).unwrap()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm text-white/60 mb-1 block">Organization Name</label>
        <input {...register('name')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50" />
      </div>
      <div>
        <label className="text-sm text-white/60 mb-1 block">From Name (for emails)</label>
        <input {...register('fromName')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50" placeholder="e.g. Acme Recognition" />
      </div>
      <div>
        <label className="text-sm text-white/60 mb-1 block">From Email</label>
        <input type="email" {...register('fromEmail')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50" placeholder="recognition@acme.com" />
      </div>
      <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-colors disabled:opacity-50">
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}

function SmtpTab({ hasConfig }: { hasConfig: boolean }) {
  const [updateSmtp, { isLoading }] = useUpdateSmtpMutation()
  const [testSmtp, { isLoading: isTesting }] = useTestSmtpMutation()
  const { register, handleSubmit } = useForm({ defaultValues: { host: '', port: 587, secure: false, user: '', pass: '' } })

  return (
    <div className="space-y-6">
      <div className={`p-3 rounded-lg text-sm ${hasConfig ? 'bg-accent/10 border border-accent/30 text-accent-light' : 'bg-white/5 border border-white/10 text-white/40'}`}>
        {hasConfig ? '✓ SMTP is configured' : 'No SMTP configured — system email will be used'}
      </div>
      <form onSubmit={handleSubmit(d => updateSmtp(d))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm text-white/60 mb-1 block">SMTP Host</label>
            <input {...register('host')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50" placeholder="smtp.gmail.com" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Port</label>
            <input type="number" {...register('port')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" {...register('secure')} id="secure" className="w-4 h-4 accent-accent" />
            <label htmlFor="secure" className="text-sm text-white/60">Use TLS/SSL</label>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Username</label>
            <input {...register('user')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Password</label>
            <input type="password" {...register('pass')} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-accent/50" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-dark transition-colors disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save SMTP'}
          </button>
          {hasConfig && (
            <button type="button" onClick={() => testSmtp()} disabled={isTesting} className="px-6 py-2.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors disabled:opacity-50">
              {isTesting ? 'Testing...' : 'Send Test Email'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function BackgroundsTab() {
  const { data: bgs = [] } = useGetBackgroundsQuery()
  const [createBg] = useCreateBackgroundMutation()
  const [deleteBg] = useDeleteBackgroundMutation()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('image', file)
    form.append('name', file.name.replace(/\.[^.]+$/, ''))
    await createBg(form).unwrap()
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {bgs.map(bg => (
          <div key={bg.id} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video">
            <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!bg.isDefault && (
                <button onClick={() => deleteBg(bg.id)} className="p-1.5 rounded-lg bg-red-500/80 text-white text-xs hover:bg-red-500 transition-colors">Delete</button>
              )}
              {bg.isDefault && <span className="text-xs text-white/80">Default</span>}
            </div>
          </div>
        ))}
        <label className="cursor-pointer rounded-xl border border-dashed border-white/20 aspect-video flex flex-col items-center justify-center text-white/30 hover:border-accent/50 hover:text-accent-light transition-colors">
          <span className="text-2xl mb-1">+</span>
          <span className="text-xs">Upload Custom</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
    </div>
  )
}
