import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Privacy <span className="gradient-text">Policy</span></h1>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-slate-600 dark:text-slate-400">Last updated: January 1, 2024</p>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Information We Collect</h2>
              <p className="text-slate-600 dark:text-slate-400">We collect information you provide directly to us, including your name, email address, phone number, resume, work history, education, and skills. We also collect information about your use of our platform, including jobs viewed, applications submitted, and preferences.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
              <p className="text-slate-600 dark:text-slate-400">We use your information to provide and improve our job matching services, connect you with potential employers, send notifications about relevant opportunities, and enhance platform security.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Information Sharing</h2>
              <p className="text-slate-600 dark:text-slate-400">We share your information with employers when you apply to jobs. We do not sell your personal information to third parties. We may share anonymized data for analytics and platform improvement.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Data Security</h2>
              <p className="text-slate-600 dark:text-slate-400">We implement industry-standard security measures to protect your data, including encryption at rest and in transit, regular security audits, and strict access controls.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Your Rights</h2>
              <p className="text-slate-600 dark:text-slate-400">You have the right to access, update, delete your data, and opt out of certain data processing activities. Contact us at privacy@jobportal.com to exercise your rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Contact</h2>
              <p className="text-slate-600 dark:text-slate-400">For privacy-related inquiries, contact our Data Protection Officer at privacy@jobportal.com.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
