import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useRegisterMutation } from '@/store/api/authApi'
import { registerSchema } from '@/lib/zod-schemas'
import type { z } from 'zod'

type FormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [register_, { isLoading, error }] = useRegisterMutation()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: FormValues) => {
    try {
      await register_(data).unwrap()
      navigate('/app/dashboard')
    } catch {}
  }

  const apiError = (error as { data?: { error?: string } })?.data?.error

  const fields: { name: keyof FormValues; label: string; type: string; placeholder: string }[] = [
    { name: 'orgName', label: 'Organization Name', type: 'text', placeholder: 'Acme Corp' },
    { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Jane Smith' },
    { name: 'email', label: 'Work Email', type: 'email', placeholder: 'jane@acme.com' },
    { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-accent to-accent-light" />
          <div className="p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Register your organization</h1>
            <p className="text-white/50 text-sm mb-8">Get started with Spot Recognition in minutes</p>

            {apiError && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{apiError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="text-sm text-white/60 mb-1 block">{f.label}</label>
                  <input type={f.type} {...register(f.name)} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors" placeholder={f.placeholder} />
                  {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name]?.message}</p>}
                </div>
              ))}
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-white/40">
              Already have an account? <Link to="/auth/login" className="text-accent-light hover:text-accent transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
