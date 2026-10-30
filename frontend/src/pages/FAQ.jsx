import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineChevronDown } from 'react-icons/hi2'

const faqs = [
  { q: 'How does JobPortal work?', a: 'JobPortal uses AI-powered matching to connect job seekers with relevant opportunities. Create a profile, upload your resume, and our algorithms will match you with jobs that fit your skills and experience.' },
  { q: 'Is JobPortal free for job seekers?', a: 'Yes! JobPortal is completely free for job seekers. You can create a profile, search jobs, apply, and use our AI tools at no cost.' },
  { q: 'How do I apply for a job?', a: 'Simply click "Apply Now" on any job listing. If you have a complete profile, you can apply with one click. You can track all your applications from your dashboard.' },
  { q: 'How accurate is the AI matching?', a: 'Our AI achieves 95%+ accuracy in matching candidates to relevant positions. It analyzes your skills, experience, preferences, and career goals to find the best-fit opportunities.' },
  { q: 'Can employers contact me directly?', a: 'Yes! If your profile matches a job requirement, employers can reach out to you directly through our platform. You can control your privacy settings.' },
  { q: 'How do I upload my resume?', a: 'Go to your profile dashboard and click on "Upload Resume". We support PDF, DOC, and DOCX formats. Our AI will analyze your resume to extract skills and experience.' },
  { q: 'What is the ATS Score?', a: 'ATS (Applicant Tracking System) Score predicts how well your resume will perform with employer ATS systems. Our AI analyzes formatting, keywords, and content to optimize your resume.' },
  { q: 'How do I schedule interviews?', a: 'When you are shortlisted, recruiters can send interview invitations through the platform. You\'ll see available slots and can confirm your preferred time.' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked <span className="gradient-text">Questions</span></h1>
          <p className="text-slate-600 dark:text-slate-400">Everything you need to know about JobPortal</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white pr-4">{faq.q}</span>
                <HiOutlineChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
