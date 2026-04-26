import { motion } from 'framer-motion'

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <h1 className="text-4xl font-bold text-white">About SpotRecognition</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          SpotRecognition was built to solve a simple problem: recognizing great work shouldn't require a complex HR system or an expensive tool. We believe every team deserves a fast, beautiful way to celebrate wins.
        </p>
        <p className="text-white/60 leading-relaxed">
          Our platform lets organizations send Spot Recognition awards with a personalized Wall of Fame image, delivered directly to winners via email — in minutes, not hours.
        </p>
        <p className="text-white/60 leading-relaxed">
          Built by a small team that cares about workplace culture, we're committed to keeping SpotRecognition simple, secure, and genuinely useful.
        </p>
      </motion.div>
    </div>
  )
}
