import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

export function ContactPage() {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm()

  const onSubmit = async (data: unknown) => {
    await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
        <p className="text-white/60 mb-8">Have a question or want to learn more? Send us a message.</p>

        {isSubmitSuccessful ? (
          <div className="p-6 rounded-xl bg-accent/10 border border-accent/30 text-accent-light">Thanks! We'll be in touch soon.</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">Name</label>
              <input {...register('name', { required: true })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Email</label>
              <input type="email" {...register('email', { required: true })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Message</label>
              <textarea rows={5} {...register('message', { required: true })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 resize-none" placeholder="How can we help?" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
