import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Users, History, Mail, Award, Shield } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

const features = [
  { icon: Star, title: 'Send Spot Recognition', desc: 'Honor your teammates with beautiful, shareable Wall of Fame cards and personalized badges.' },
  { icon: Users, title: 'Team Management', desc: 'Manage your org\'s users, sync from Active Directory, and keep your roster up to date.' },
  { icon: History, title: 'Recognition History', desc: 'Track every recognition ever sent — filter by winner, badge, or date range.' },
  { icon: Mail, title: 'Automated Email Delivery', desc: 'The Wall of Fame image is emailed directly to winners the moment you hit send.' },
  { icon: Award, title: '7 Achievement Badges', desc: 'Brain Wave, Rockstar, Juggler and more — pick the badge that fits the achievement.' },
  { icon: Shield, title: 'Org Data Isolation', desc: 'Each organization\'s data is fully isolated. Your recognition culture stays private.' },
]

const plans = [
  { name: 'Free', price: '$0', desc: 'Up to 10 spots/month', features: ['10 spots/month', 'Default background', 'Email delivery', '5 users'] },
  { name: 'Pro', price: '$29', desc: 'Unlimited spotlights', features: ['Unlimited spots', 'Custom backgrounds', 'Custom branding', 'CSV import', 'Priority support'], highlight: true },
  { name: 'Enterprise', price: 'Custom', desc: 'For large teams', features: ['Everything in Pro', 'Azure AD sync', 'SSO', 'SLA', 'Dedicated support'] },
]

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-light/15 rounded-full filter blur-3xl animate-pulse delay-1000" />
        </div>
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="text-center max-w-4xl relative z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent-light text-sm font-medium mb-6">
            <Star className="w-4 h-4" /> Celebrate your team's wins
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Recognize greatness.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">Every single day.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Spot Recognition lets your organization celebrate teammates with beautiful Wall of Fame cards, automated emails, and a permanent history of appreciation.
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
            <Link to="/auth/register" className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-accent/30">
              Start for Free
            </Link>
            <Link to="/about" className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/5 transition-colors">
              Learn More
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white text-center mb-4">Everything your team needs</motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-center mb-16">Built for modern organizations that care about culture.</motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeUp} className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-accent/30 hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-accent-light" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white text-center mb-4">Simple, transparent pricing</motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-center mb-16">Start free, upgrade when you need more.</motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(plan => (
                <motion.div key={plan.name} variants={fadeUp} className={`p-6 rounded-2xl border ${plan.highlight ? 'border-accent bg-accent/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="text-white font-bold text-lg mb-1">{plan.name}</div>
                  <div className="text-3xl font-bold text-white mb-1">{plan.price}<span className="text-sm font-normal text-white/50">{plan.price !== 'Custom' ? '/mo' : ''}</span></div>
                  <div className="text-white/50 text-sm mb-6">{plan.desc}</div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map(f => <li key={f} className="text-white/70 text-sm flex items-center gap-2"><span className="text-accent-light">✓</span>{f}</li>)}
                  </ul>
                  <Link to="/auth/register" className={`block text-center py-2 rounded-lg font-medium text-sm transition-all ${plan.highlight ? 'bg-accent text-white hover:bg-accent-dark' : 'border border-white/20 text-white hover:bg-white/10'}`}>
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
