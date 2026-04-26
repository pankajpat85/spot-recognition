import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useForgotPasswordMutation } from '@/store/api/authApi'

export function ForgotPasswordPage() {
  const [forgot, { isLoading, isSuccess }] = useForgotPasswordMutation()
  const { register, handleSubmit } = useForm<{ email: string }>()

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Reset password</h1>
          <p className="text-white/50 text-sm mb-8">Enter your email and we'll send a reset link.</p>
          {isSuccess ? (
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 text-accent-light text-sm">Check your email for the reset link.</div>
          ) : (
            <form onSubmit={handleSubmit(d => forgot(d))} className="space-y-4">
              <input type="email" {...register('email', { required: true })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50" placeholder="you@example.com" />
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-white/40"><Link to="/auth/login" className="text-accent-light hover:text-accent">Back to login</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
