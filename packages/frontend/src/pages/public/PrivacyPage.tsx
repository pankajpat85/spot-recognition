import { motion } from 'framer-motion'

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-white/60">
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        <p>Last updated: January 2025</p>
        <h2 className="text-xl font-semibold text-white">Data We Collect</h2>
        <p>We collect organization name, admin contact details, and employee data (name, email, photo) that you add to the platform. We also store spot recognition records created within your account.</p>
        <h2 className="text-xl font-semibold text-white">Data Isolation</h2>
        <p>Each organization's data is strictly isolated. No organization can access another's data. All data is associated with a unique organization identifier enforced at the database level.</p>
        <h2 className="text-xl font-semibold text-white">Data Storage</h2>
        <p>Data is stored securely on servers. SMTP passwords are encrypted at rest using AES-256 encryption. Passwords are hashed using bcrypt.</p>
        <h2 className="text-xl font-semibold text-white">Data Deletion</h2>
        <p>You may delete your account and all associated data at any time by contacting us. User records are soft-deleted and purged within 30 days.</p>
        <h2 className="text-xl font-semibold text-white">Contact</h2>
        <p>For privacy inquiries, contact us at privacy@spotrecognition.app</p>
      </motion.div>
    </div>
  )
}
