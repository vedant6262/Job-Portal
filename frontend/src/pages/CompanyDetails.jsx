import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineArrowLeft, HiOutlineGlobeAlt, HiOutlineMapPin, HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineCheckBadge, HiOutlineStar } from 'react-icons/hi2'
import JobCard from '../components/ui/JobCard'

const company = {
  id: 1,
  name: 'TechCorp',
  industry: 'Technology',
  size: '1000-5000 employees',
  headquarters: 'San Francisco, CA',
  website: 'https://techcorp.com',
  description: 'TechCorp is a leading technology company building the future of cloud computing. We empower businesses with innovative solutions that drive digital transformation. Our platform serves millions of users worldwide, and we are committed to creating an inclusive, diverse, and collaborative workplace.',
  founded: '2015',
  benefits: ['Health Insurance', 'Remote Work', 'Stock Options', 'Learning Budget', 'Gym Membership', 'Free Meals'],
  review: { rating: 4.5, count: 234 },
  openPositions: 12,
  jobs: [
    { id: 1, title: 'Senior React Developer', companyName: 'TechCorp', location: 'San Francisco, CA', salary: '$120k-$180k', employmentType: 'Full-time', experience: 'Senior', workMode: 'Hybrid', skills: ['React', 'TypeScript', 'GraphQL'], createdAt: new Date().toISOString() },
    { id: 2, title: 'Backend Engineer', companyName: 'TechCorp', location: 'Remote', salary: '$130k-$190k', employmentType: 'Full-time', experience: 'Senior', workMode: 'Remote', skills: ['Node.js', 'Python', 'AWS'], createdAt: new Date().toISOString() },
    { id: 3, title: 'Product Designer', companyName: 'TechCorp', location: 'San Francisco, CA', salary: '$100k-$150k', employmentType: 'Full-time', experience: 'Mid-Level', workMode: 'On-site', skills: ['Figma', 'UI/UX', 'Design Systems'], createdAt: new Date().toISOString() },
  ],
}

export default function CompanyDetails() {
  const { id } = useParams()

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/companies" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center shrink-0">
                <span className="text-3xl font-bold gradient-text">{company.name[0]}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{company.industry}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <HiOutlineStar className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{company.review.rating}</span>
                    <span className="text-xs text-slate-500">({company.review.count} reviews)</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">{company.description}</p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <HiOutlineMapPin className="w-4 h-4" /> {company.headquarters}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <HiOutlineUserGroup className="w-4 h-4" /> {company.size}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <HiOutlineGlobeAlt className="w-4 h-4" /> {company.website}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <HiOutlineBuildingOffice2 className="w-4 h-4" /> Founded {company.founded}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Benefits & Perks</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {company.benefits.map(ben => (
                <div key={ben} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <HiOutlineCheckBadge className="w-4 h-4 text-secondary-500" />
                  {ben}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Open Positions ({company.jobs.length})</h2>
            <div className="space-y-4">
              {company.jobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
