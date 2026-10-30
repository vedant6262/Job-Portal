import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineBuildingOffice2 } from 'react-icons/hi2'

const companies = [
  { id: 1, name: 'TechCorp', industry: 'Technology', location: 'San Francisco, CA', jobs: 12, employees: '1000-5000', description: 'Leading technology company building the future of cloud computing.' },
  { id: 2, name: 'DataFlow', industry: 'Data Science', location: 'New York, NY', jobs: 8, employees: '500-1000', description: 'Enterprise data analytics platform powering business decisions.' },
  { id: 3, name: 'DesignHub', industry: 'Design', location: 'London, UK', jobs: 15, employees: '200-500', description: 'Creative design agency crafting digital experiences.' },
  { id: 4, name: 'AI Labs', industry: 'Artificial Intelligence', location: 'Remote', jobs: 20, employees: '1000-5000', description: 'Pioneering AI research and applications.' },
  { id: 5, name: 'CloudNine', industry: 'Cloud Computing', location: 'Seattle, WA', jobs: 10, employees: '5000+', description: 'Cloud infrastructure and services provider.' },
  { id: 6, name: 'CyberSec', industry: 'Cybersecurity', location: 'Austin, TX', jobs: 6, employees: '200-500', description: 'Next-gen cybersecurity solutions for enterprises.' },
  { id: 7, name: 'WebWizards', industry: 'Web Development', location: 'Berlin, DE', jobs: 9, employees: '50-200', description: 'Full-stack web development agency.' },
  { id: 8, name: 'ServerStack', industry: 'Backend Infrastructure', location: 'Boston, MA', jobs: 7, employees: '200-500', description: 'Backend infrastructure and API management platform.' },
]

export default function Companies() {
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('')

  const filtered = companies.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false
    if (industry && c.industry !== industry) return false
    return true
  })

  const industries = [...new Set(companies.map(c => c.industry))]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Top <span className="gradient-text">Companies</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3">
              <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300" />
            </div>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className="input-field w-auto">
              <option value="">All Industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/companies/${company.id}`} className="block glass-card p-6 group hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold gradient-text">{company.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{company.industry}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{company.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-xs text-slate-500">{company.location}</span>
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{company.jobs} open jobs</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <HiOutlineBuildingOffice2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No companies found</h3>
          </div>
        )}
      </div>
    </div>
  )
}
