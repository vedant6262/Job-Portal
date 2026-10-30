import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineArrowDownTray, HiOutlineCheckBadge, HiOutlineXMark, HiOutlineCalendar, HiOutlineEye, HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2'

const applicants = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', role: 'Senior React Developer', experience: '6 years', score: 92, status: 'Shortlisted', appliedDate: '2 days ago', skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'] },
  { id: 2, name: 'Michael Chen', email: 'michael@email.com', role: 'Full Stack Engineer', experience: '5 years', score: 88, status: 'Under Review', appliedDate: '3 days ago', skills: ['Node.js', 'Python', 'AWS', 'Docker'] },
  { id: 3, name: 'Priya Patel', email: 'priya@email.com', role: 'Product Designer', experience: '4 years', score: 85, status: 'Interview', appliedDate: '4 days ago', skills: ['Figma', 'UI/UX', 'Design Systems'] },
  { id: 4, name: 'James Wilson', email: 'james@email.com', role: 'DevOps Engineer', experience: '7 years', score: 78, status: 'New', appliedDate: '1 day ago', skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
  { id: 5, name: 'Emily Davis', email: 'emily@email.com', role: 'Data Scientist', experience: '3 years', score: 82, status: 'Rejected', appliedDate: '5 days ago', skills: ['Python', 'TensorFlow', 'SQL', 'ML'] },
]

export default function Applicants() {
  const { jobId } = useParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = applicants.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && a.status !== statusFilter) return false
    return true
  })

  const statusColors = {
    'Shortlisted': 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400',
    'Under Review': 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    'Interview': 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    'New': 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    'Rejected': 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Applicants</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Review and manage applicants for your job listing.</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3">
          <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicants..." className="bg-transparent border-none outline-none text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((applicant, i) => (
          <motion.div
            key={applicant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shrink-0">
                {applicant.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{applicant.name}</h3>
                    <p className="text-sm text-slate-500">{applicant.role}</p>
                    <p className="text-xs text-slate-400">{applicant.email} · {applicant.experience} exp</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{applicant.score}%</p>
                    <p className="text-[10px] text-slate-500">Match Score</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {applicant.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{s}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[applicant.status]}`}>{applicant.status}</span>
                  {applicant.status !== 'Rejected' && (
                    <>
                      <button className="btn-ghost p-1.5 text-secondary-500"><HiOutlineCheckBadge className="w-4 h-4" /></button>
                      <button className="btn-ghost p-1.5 text-red-500"><HiOutlineXMark className="w-4 h-4" /></button>
                      <button className="btn-ghost p-1.5 text-primary-500"><HiOutlineCalendar className="w-4 h-4" /></button>
                    </>
                  )}
                  <button className="btn-ghost p-1.5 ml-auto"><HiOutlineArrowDownTray className="w-4 h-4" /> Resume</button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
