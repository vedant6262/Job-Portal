import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineEnvelope, HiOutlineMapPin, HiOutlinePhone, HiOutlinePaperAirplane } from 'react-icons/hi2'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Get in <span className="gradient-text">Touch</span></h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Have a question, feedback, or want to partner with us? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                <HiOutlineEnvelope className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Email</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">hello@jobportal.com</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">support@jobportal.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                <HiOutlinePhone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Phone</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">+1 (555) 123-4567</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Mon-Fri 9am-6pm EST</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0">
                <HiOutlineMapPin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Office</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">123 Innovation Drive, Suite 400</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">San Francisco, CA 94105</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            {submitted ? (
              <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-500/10 flex items-center justify-center mx-auto mb-4">
                  <HiOutlinePaperAirplane className="w-8 h-8 text-secondary-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><input type="text" placeholder="Your Name" required className="input-field" /></div>
                  <div><input type="email" placeholder="Your Email" required className="input-field" /></div>
                </div>
                <div><input type="text" placeholder="Subject" required className="input-field" /></div>
                <div><textarea rows={5} placeholder="Your Message" required className="input-field resize-none" /></div>
                <button type="submit" className="btn-primary w-full"><HiOutlinePaperAirplane className="w-5 h-5" /> Send Message</button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
