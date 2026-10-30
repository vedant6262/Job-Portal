import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineMagnifyingGlass, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineChartBar,
  HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineGlobeAlt, HiOutlineClock,
  HiOutlineArrowTrendingUp, HiOutlineStar, HiOutlineBuildingOffice2, HiOutlineAcademicCap,
  HiOutlineCheckBadge, HiOutlineArrowRight, HiOutlinePlayCircle, HiOutlineArrowUpRight,
  HiOutlineUsers, HiOutlineLightBulb,
} from 'react-icons/hi2'
import JobCard from '../components/ui/JobCard'
import { useExternalJobs } from '../hooks/useJobs'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
}

const stats = [
  { icon: HiOutlineBriefcase, value: '10,000+', label: 'Active Jobs' },
  { icon: HiOutlineBuildingOffice2, value: '5,000+', label: 'Companies' },
  { icon: HiOutlineUserGroup, value: '2M+', label: 'Job Seekers' },
  { icon: HiOutlineChartBar, value: '98%', label: 'Success Rate' },
]

const features = [
  {
    icon: HiOutlineSparkles,
    title: 'AI-Powered Matching',
    description: 'Smart algorithms match your skills with the perfect job opportunities.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: HiOutlineGlobeAlt,
    title: 'Global Opportunities',
    description: 'Access remote and on-site positions from top companies worldwide.',
    color: 'from-secondary-500 to-secondary-600',
  },
  {
    icon: HiOutlineClock,
    title: 'Quick Apply',
    description: 'Apply to multiple jobs with one click using your saved profile.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: HiOutlineArrowTrendingUp,
    title: 'Career Growth',
    description: 'Get personalized recommendations to advance your career.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Skill Development',
    description: 'Access curated courses and resources to upskill yourself.',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Verified Companies',
    description: 'Every company is verified to ensure a safe job search experience.',
    color: 'from-cyan-500 to-cyan-600',
  },
]

const companies = [
  { name: 'TechCorp', industry: 'Technology', jobs: 12 },
  { name: 'DesignHub', industry: 'Design', jobs: 8 },
  { name: 'DataFlow', industry: 'Data Science', jobs: 15 },
  { name: 'CloudNine', industry: 'Cloud Computing', jobs: 10 },
  { name: 'CyberSec', industry: 'Cybersecurity', jobs: 6 },
  { name: 'AI Labs', industry: 'Artificial Intelligence', jobs: 20 },
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Engineer at Google',
    text: 'JobPortal helped me land my dream job at Google. The AI matching was incredibly accurate!',
    avatar: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Product Designer at Apple',
    text: 'The resume optimization feature gave me the edge I needed. Highly recommend!',
    avatar: 'MC',
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist at Amazon',
    text: 'Found 5 interviews in my first week. The platform is intuitive and powerful.',
    avatar: 'PP',
  },
]

const partnerBrands = ['Google', 'Microsoft', 'Amazon', 'Stripe', 'Notion', 'Spotify', 'Shopify', 'Meta']

const pathwayCards = [
  {
    title: 'For Students',
    desc: 'Discover internships, upskilling tracks, and project-based opportunities that lead to real-world roles.',
    icon: HiOutlineAcademicCap,
    accent: 'from-violet-500 to-indigo-600',
  },
  {
    title: 'For Professionals',
    desc: 'Level up your career with smarter job discovery, AI-guided applications, and personalized recommendations.',
    icon: HiOutlineUsers,
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'For Recruiters',
    desc: 'Access high-signal applicants, move faster with smarter filtering, and build stronger hiring pipelines.',
    icon: HiOutlineLightBulb,
    accent: 'from-emerald-500 to-teal-600',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const { data: featuredData } = useExternalJobs({ perPage: 4 })
  const featuredJobs = (featuredData?.data || []).slice(0, 4).map(job => ({
    id: job.slug,
    slug: job.slug,
    title: job.title,
    companyName: job.company_name,
    companyLogo: job.company_logo || null,
    companyId: job.slug,
    location: job.location || 'Remote',
    salary: job.salary || '',
    employmentType: job.job_types?.[0] || 'Full-time',
    experience: '',
    workMode: job.remote ? 'Remote' : 'On-site',
    skills: job.tags || [],
    createdAt: new Date(job.created_at * 1000).toISOString(),
  }))

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchLocation) params.set('location', searchLocation)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center bg-gradient-to-br from-slate-50 via-white to-primary-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-primary-950/30">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
                <HiOutlineSparkles className="w-4 h-4" />
                AI-Powered Job Search
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Find Your{' '}
                <span className="gradient-text">Dream Job</span>
                <br />
                With AI Precision
              </h1>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                Join millions of job seekers using AI-powered matching to land their ideal roles at top companies worldwide.
              </p>

              <form onSubmit={handleSearch} className="mt-8">
                <div className="flex flex-col sm:flex-row gap-3 p-2 glass-card max-w-2xl">
                  <div className="flex-1 flex items-center gap-3 px-4 py-2">
                    <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Job title, skill, or keyword"
                      className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300 placeholder-slate-400"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-700">
                    <HiOutlineGlobeAlt className="w-5 h-5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={e => setSearchLocation(e.target.value)}
                      placeholder="Location or remote"
                      className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-300 placeholder-slate-400"
                    />
                  </div>
                  <button type="submit" className="btn-primary px-8 py-3">
                    <HiOutlineMagnifyingGlass className="w-5 h-5" />
                    Search
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium">Popular:</span>
                {['React', 'Python', 'Design', 'Remote', 'Internship'].map((tag, i) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); navigate(`/jobs?q=${tag}`) }}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <div className="w-full aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl" />
                  <div className="absolute top-10 left-10 w-40 h-40 bg-primary-500/20 rounded-2xl rotate-12 animate-float" />
                  <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary-500/20 rounded-2xl -rotate-6 animate-float" style={{ animationDelay: '2s' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="glass-card p-8">
                      <HiOutlineBriefcase className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                      <p className="text-3xl font-bold gradient-text">10,000+</p>
                      <p className="text-sm text-slate-500">Active Jobs</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card overflow-hidden">
            <div className="border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-slate-700/80 dark:bg-slate-800/80">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Trusted by leading teams worldwide
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-6 py-5 md:grid-cols-4 lg:grid-cols-8">
              {partnerBrands.map((brand) => (
                <div key={brand} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-sm font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-12 text-center" {...fadeInUp}>
            <h2 className="section-title">Career paths built for every stage</h2>
            <p className="section-subtitle mx-auto">
              From first internships to executive hiring, JobPortal helps people move forward with confidence.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pathwayCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_rgba(79,70,229,0.45)] dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{card.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{card.desc}</p>
                  <button onClick={() => navigate(card.title === 'For Recruiters' ? '/recruiter/login' : '/jobs')} className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    Explore now <HiOutlineArrowUpRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="section-title">Why Choose JobPortal?</h2>
            <p className="section-subtitle mx-auto">
              We combine cutting-edge AI technology with a seamless user experience to transform your job search.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card p-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex items-end justify-between mb-12" {...fadeInUp}>
            <div>
              <h2 className="section-title">Featured Jobs</h2>
              <p className="section-subtitle">Discover opportunities from top companies</p>
            </div>
            <Link to="/jobs" className="btn-ghost text-primary-600 dark:text-primary-400 hidden sm:flex items-center gap-2">
              View All <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredJobs.length > 0 ? featuredJobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            )) : [1, 2, 3, 4].map(i => (
              <JobCard
                key={i}
                job={{
                  id: i,
                  title: ['Senior React Developer', 'Full Stack Engineer', 'Product Designer', 'Data Scientist'][i - 1],
                  companyName: ['TechCorp', 'DataFlow', 'DesignHub', 'AI Labs'][i - 1],
                  companyLogo: null,
                  companyId: i,
                  location: ['San Francisco, CA', 'New York, NY', 'London, UK', 'Remote'][i - 1],
                  salary: ['$120k - $180k', '$130k - $190k', '$100k - $150k', '$140k - $200k'][i - 1],
                  employmentType: ['Full-time', 'Full-time', 'Full-time', 'Full-time'][i - 1],
                  experience: ['Senior', 'Mid-Level', 'Senior', 'Senior'][i - 1],
                  workMode: ['Hybrid', 'Remote', 'On-site', 'Remote'][i - 1],
                  skills: [['React', 'TypeScript', 'GraphQL'], ['Node.js', 'Python', 'AWS'], ['Figma', 'UI/UX', 'Design Systems'], ['Python', 'ML', 'TensorFlow']][i - 1],
                  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
                }}
                index={i}
              />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/jobs" className="btn-primary">View All Jobs</Link>
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="section-title">Top Companies Hiring</h2>
            <p className="section-subtitle mx-auto">Join thousands of companies that trust JobPortal for their hiring needs</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {companies.map((company, i) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-6 text-center group hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold gradient-text">{company.name[0]}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{company.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{company.industry}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 font-medium">{company.jobs} open jobs</p>
              </motion.div>
            ))}
          </div>

          <motion.div className="text-center mt-10" {...fadeInUp}>
            <Link to="/companies" className="btn-secondary">View All Companies</Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
              <HiOutlineStar className="w-4 h-4" />
              Success Stories
            </span>
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle mx-auto">Real stories from real people who found their dream jobs through JobPortal</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <HiOutlineStar key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join over 2 million job seekers who have found their dream careers. Your next opportunity is waiting.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/jobs" className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300 shadow-xl">
                <HiOutlineMagnifyingGlass className="w-5 h-5" />
                Browse Jobs
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                <HiOutlinePlayCircle className="w-5 h-5" />
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
