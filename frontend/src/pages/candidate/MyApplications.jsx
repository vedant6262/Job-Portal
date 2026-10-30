import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2'

const applications = [
  { id: 1, company: 'TechCorp', role: 'Senior React Developer', location: 'San Francisco, CA', appliedDate: '2 days ago', status: 'Applied', logo: 'T' },
  { id: 2, company: 'DataFlow', role: 'Full Stack Engineer', location: 'Remote', appliedDate: '5 days ago', status: 'Shortlisted', logo: 'D' },
  { id: 3, company: 'DesignHub', role: 'Product Designer', location: 'London, UK', appliedDate: '1 week ago', status: 'Rejected', logo: 'D' },
  { id: 4, company: 'AI Labs', role: 'Data Scientist', location: 'Remote', appliedDate: '1 week ago', status: 'Interview', logo: 'A' },
  { id: 5, company: 'CloudNine', role: 'Cloud Architect', location: 'Seattle, WA', appliedDate: '2 weeks ago', status: 'Hired', logo: 'C' },
]

const statusColors = {
  Applied: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  Shortlisted: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  Interview: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400',
  Hired: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  Rejected: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  Offered: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
}

export default function MyApplications() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')

  const filtered = applications.filter(app => {
    if (search && !app.role.toLowerCase().includes(search.toLowerCase()) && !app.company.toLowerCase().includes(search.toLowerCase())) return false
    if (filter && app.status !== filter) return false
    return true
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My Applications</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Track all your job applications in one place.</p>

      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {['Applied', 'Shortlisted', 'Interview', 'Hired'].map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold ${
                step === 'Applied' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' :
                step === 'Shortlisted' ? 'bg-primary-100 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300' :
                step === 'Interview' ? 'bg-secondary-100 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-300' :
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              }`}>
                {index + 1}
              </span>
              <span>{step}</span>
              {index < 3 && <span className="text-slate-400">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3">
          <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          {['Applied', 'Shortlisted', 'Interview', 'Hired', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center shrink-0">
                <span className="font-bold gradient-text">{app.logo}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{app.role}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{app.company} · {app.location}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Applied {app.appliedDate}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${statusColors[app.status]}`}>
                  {app.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
