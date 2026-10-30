import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineCheckBadge, HiOutlineXMark, HiOutlineEye } from 'react-icons/hi2'

const recruiters = [
  { id: 1, name: 'TechCorp', email: 'hr@techcorp.com', rep: 'Sarah Lee', jobs: 12, status: 'Approved', joined: 'Jan 2024' },
  { id: 2, name: 'DataFlow', email: 'careers@dataflow.com', rep: 'Mike Chen', jobs: 8, status: 'Pending', joined: 'Feb 2024' },
  { id: 3, name: 'DesignHub', email: 'jobs@designhub.com', rep: 'Anna Kim', jobs: 15, status: 'Approved', joined: 'Mar 2024' },
  { id: 4, name: 'NewCompany', email: 'info@newco.com', rep: 'Tom Brown', jobs: 0, status: 'Pending', joined: 'Jun 2024' },
]

export default function ManageRecruiters() {
  const [search, setSearch] = useState('')

  const filtered = recruiters.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.rep.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Manage Recruiters</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Approve and manage recruiter accounts.</p>

      <div className="flex items-center gap-3 glass-card px-4 py-3 mb-6">
        <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recruiters..." className="bg-transparent border-none outline-none text-sm w-full" />
      </div>

      <div className="space-y-3">
        {filtered.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold gradient-text">{r.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{r.name}</h3>
                <p className="text-sm text-slate-500">{r.email}</p>
                <p className="text-xs text-slate-400">Rep: {r.rep} · {r.jobs} jobs · Joined {r.joined}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                r.status === 'Approved' ? 'bg-secondary-50 text-secondary-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {r.status}
              </span>
              <div className="flex items-center gap-1">
                <button className="btn-ghost p-1.5 text-secondary-500"><HiOutlineCheckBadge className="w-5 h-5" /></button>
                <button className="btn-ghost p-1.5 text-red-500"><HiOutlineXMark className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
