import { motion } from 'framer-motion'

export default function TermsConditions() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Terms & <span className="gradient-text">Conditions</span></h1>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <p className="text-slate-600 dark:text-slate-400">Last updated: January 1, 2024</p>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
              <p className="text-slate-600 dark:text-slate-400">By accessing and using JobPortal, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. User Accounts</h2>
              <p className="text-slate-600 dark:text-slate-400">You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Job Listings</h2>
              <p className="text-slate-600 dark:text-slate-400">Employers are responsible for the accuracy of job listings. JobPortal reserves the right to remove listings that violate our policies or are deemed fraudulent.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Prohibited Activities</h2>
              <p className="text-slate-600 dark:text-slate-400">Users may not: post false information, harass other users, attempt to breach platform security, use automated tools to scrape data, or engage in any illegal activities on the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Limitation of Liability</h2>
              <p className="text-slate-600 dark:text-slate-400">JobPortal is not responsible for the actions of employers or job seekers on the platform. We facilitate connections but do not guarantee employment outcomes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Modifications</h2>
              <p className="text-slate-600 dark:text-slate-400">We reserve the right to modify these terms at any time. Users will be notified of material changes via email or platform notification.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
