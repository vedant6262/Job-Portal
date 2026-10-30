import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEye, HiOutlineUsers, HiOutlineMagnifyingGlass } from 'react-icons/hi2'

const jobs = [
  { id: 1, title: 'Senior React Developer', location: 'San Francisco, CA', applicants: 15, status: 'Active', posted: '2 days ago' },
  { id: 2, title: 'Full Stack Engineer', location: 'Remote', applicants: 23, status: 'Active', posted: '5 days ago' },
  { id: 3, title: 'Product Designer', location: 'London, UK', applicants: 8, status: 'Active', posted: '1 week ago' },
  { id: 4, title: 'DevOps Engineer', location: 'Seattle, WA', applicants: 0, status: 'Draft', posted: '2 weeks ago' },
  { id: 5, title: 'Data Scientist', location: 'Remote', applicants: 12, status: 'Closed', posted: '3 weeks ago' },
]

export default function ManageJobs() {
  const [search, setSearch] = useState('')

  const filtered = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Jobs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all your job listings.</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary">Post New Job</Link>
      </div>

      <div className="flex items-center gap-3 glass-card px-4 py-3 mb-6">
        <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300" />
      </div>

      <div className="space-y-3">
        {filtered.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <Link to={`/jobs/${job.id}`} className="text-base font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors">{job.title}</Link>
                <p className="text-sm text-slate-500">{job.location}</p>
                <p className="text-xs text-slate-400 mt-1">Posted {job.posted}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{job.applicants}</p>
                <p className="text-xs text-slate-500">Applicants</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                job.status === 'Active' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' :
                job.status === 'Draft' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {job.status}
              </span>
              <div className="flex items-center gap-1">
                <Link to={`/recruiter/applicants/${job.id}`} className="btn-ghost p-2"><HiOutlineUsers className="w-4 h-4" /></Link>
                <button className="btn-ghost p-2"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                <button className="btn-ghost p-2 text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
