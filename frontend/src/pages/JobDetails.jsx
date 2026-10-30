import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  HiOutlineMapPin, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineBuildingOffice2,
  HiOutlineBriefcase, HiOutlineShare, HiOutlineBookmark,
  HiOutlineCheckBadge, HiOutlineArrowLeft, HiOutlineGlobeAlt, HiOutlineArrowRight,
} from 'react-icons/hi2'
import { PLACEHOLDER_LOGO } from '../utils/constants'
import { useExternalJobs } from '../hooks/useJobs'

const mapArbeitnowJob = (job) => ({
  id: job.slug,
  slug: job.slug,
  title: job.title,
  companyName: job.company_name,
  companyLogo: job.company_logo || null,
  companyId: job.slug,
  description: job.description || '',
  requirements: [],
  responsibilities: [],
  benefits: [],
  location: job.location || 'Remote',
  salary: job.salary || '',
  employmentType: job.job_types?.[0] || 'Full-time',
  experience: '',
  workMode: job.remote ? 'Remote' : 'On-site',
  postedDate: new Date(job.created_at * 1000).toISOString(),
  skills: job.tags || [],
  url: job.url,
})

export default function JobDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [applied, setApplied] = useState(false)
  const { data, isLoading } = useExternalJobs({ perPage: 20 })
  const allJobs = data?.data || []
  const jobData = allJobs.find(j => j.slug === id) || allJobs[0]
  const jobDetails = jobData ? mapArbeitnowJob(jobData) : null

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="glass-card p-6 md:p-8">
              <div className="flex gap-6">
                <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex gap-2">
                    {[1,2,3,4].map(i => <div key={i} className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!jobDetails) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Job not found</h2>
          <button onClick={() => navigate('/jobs')} className="btn-primary mt-4">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <img
                src={jobDetails.companyLogo || PLACEHOLDER_LOGO + (jobDetails.companyName?.[0] || 'C')}
                alt={jobDetails.companyName}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{jobDetails.title}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {jobDetails.companyName}
                      </span>
                      <HiOutlineCheckBadge className="w-5 h-5 text-secondary-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost p-2.5"><HiOutlineShare className="w-5 h-5" /></button>
                    <button className="btn-ghost p-2.5"><HiOutlineBookmark className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineMapPin className="w-4 h-4" /> {jobDetails.location}
                  </span>
                  {jobDetails.salary && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <HiOutlineCurrencyDollar className="w-4 h-4" /> {jobDetails.salary}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineBriefcase className="w-4 h-4" /> {jobDetails.employmentType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineGlobeAlt className="w-4 h-4" /> {jobDetails.workMode}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <HiOutlineClock className="w-4 h-4" /> {timeAgo(jobDetails.postedDate)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {jobDetails.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-lg text-sm bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  {jobDetails.url ? (
                    <a href={jobDetails.url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
                      Apply on Arbeitnow <HiOutlineArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <button onClick={() => setApplied(true)} className="btn-primary">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Job Description</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">{jobDetails.description || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
