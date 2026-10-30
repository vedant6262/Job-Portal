import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineCloudArrowUp, HiOutlineBuildingOffice2, HiOutlineGlobeAlt, HiOutlineMapPin, HiOutlineUserGroup } from 'react-icons/hi2'

export default function CompanyProfile() {
  const [form, setForm] = useState({
    name: 'TechCorp',
    industry: 'Technology',
    size: '1000-5000',
    website: 'https://techcorp.com',
    headquarters: 'San Francisco, CA',
    founded: '2015',
    description: 'Leading technology company building the future of cloud computing.',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save logic
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Company Profile</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your company's public profile.</p>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center">
            <span className="text-3xl font-bold gradient-text">T</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{form.name}</h2>
            <p className="text-sm text-slate-500">{form.industry} · {form.headquarters}</p>
            <button className="btn-secondary text-sm px-4 py-2 mt-3"><HiOutlineCloudArrowUp className="w-4 h-4" /> Upload Logo</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass-card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
              <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="input-field">
                {['Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 'Manufacturing', 'Consulting'].map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Size</label>
              <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className="input-field">
                {['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'].map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
              <input type="url" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Headquarters</label>
              <input type="text" value={form.headquarters} onChange={e => setForm({ ...form, headquarters: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Founded Year</label>
              <input type="text" value={form.founded} onChange={e => setForm({ ...form, founded: e.target.value })} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Description</label>
              <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </div>
      </form>
    </div>
  )
}
