import { useState } from 'react'
import { motion } from 'framer-motion'
import JobCard from '../../components/ui/JobCard'

const savedJobs = [
  { id: 1, title: 'Senior React Developer', companyName: 'TechCorp', companyLogo: null, companyId: 1, location: 'San Francisco, CA', salary: '$120k-$180k', employmentType: 'Full-time', experience: 'Senior', workMode: 'Hybrid', skills: ['React', 'TypeScript', 'GraphQL'], createdAt: new Date().toISOString() },
  { id: 2, title: 'Full Stack Engineer', companyName: 'DataFlow', companyLogo: null, companyId: 2, location: 'Remote', salary: '$130k-$190k', employmentType: 'Full-time', experience: 'Senior', workMode: 'Remote', skills: ['Node.js', 'Python', 'AWS'], createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: 'Product Designer', companyName: 'DesignHub', companyLogo: null, companyId: 3, location: 'London, UK', salary: '$100k-$150k', employmentType: 'Full-time', experience: 'Mid-Level', workMode: 'On-site', skills: ['Figma', 'UI/UX', 'Design Systems'], createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
]

export default function SavedJobs() {
  const [saved, setSaved] = useState(savedJobs.map(j => j.id))

  const handleSave = (id) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Saved Jobs</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Jobs you've saved for later review.</p>

      <div className="space-y-4">
        {savedJobs.map((job, i) => (
          <JobCard key={job.id} job={job} isSaved={saved.includes(job.id)} onSave={handleSave} index={i} />
        ))}
        {savedJobs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400">No saved jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
