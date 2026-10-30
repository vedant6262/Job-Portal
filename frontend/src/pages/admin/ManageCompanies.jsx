import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2'

const companies = [
  { id: 1, name: 'TechCorp', industry: 'Technology', jobs: 12, status: 'Verified', logo: 'T' },
  { id: 2, name: 'DataFlow', industry: 'Data Science', jobs: 8, status: 'Verified', logo: 'D' },
  { id: 3, name: 'DesignHub', industry: 'Design', jobs: 15, status: 'Verified', logo: 'D' },
  { id: 4, name: 'Fake Company Inc', industry: 'Unknown', jobs: 0, status: 'Suspicious', logo: 'F' },
]

export default function ManageCompanies() {
  const [search, setSearch] = useState('')

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Manage Companies</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Verify and manage company profiles.</p>

      <div className="flex items-center gap-3 glass-card px-4 py-3 mb-6">
        <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="bg-transparent border-none outline-none text-sm w-full" />
      </div>

      <div className="space-y-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold gradient-text">{c.logo}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                <p className="text-sm text-slate-500">{c.industry}</p>
              </div>
              <span className="text-sm text-slate-500">{c.jobs} jobs</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                c.status === 'Verified' ? 'bg-secondary-50 text-secondary-600' : 'bg-red-50 text-red-600'
              }`}>
                {c.status}
              </span>
              <div className="flex items-center gap-1">
                <button className="btn-ghost p-1.5"><HiOutlineEye className="w-4 h-4" /></button>
                <button className="btn-ghost p-1.5 text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
