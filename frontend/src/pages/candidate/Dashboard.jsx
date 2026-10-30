import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  HiOutlineBriefcase, HiOutlineHeart, HiOutlineCalendar, HiOutlineUser,
  HiOutlineDocumentText, HiOutlineChartBar, HiOutlineArrowRight, HiOutlineSparkles,
} from 'react-icons/hi2'
import StatCard from '../../components/ui/StatCard'

export default function CandidateDashboard() {
  const stats = [
    { icon: HiOutlineDocumentText, label: 'Applications Submitted', value: '12', trend: '+3 this week', color: 'primary' },
    { icon: HiOutlineHeart, label: 'Saved Jobs', value: '8', trend: '+2 this week', color: 'rose' },
    { icon: HiOutlineCalendar, label: 'Upcoming Interviews', value: '3', trend: '+1 this week', color: 'secondary' },
    { icon: HiOutlineUser, label: 'Profile Completion', value: '75%', trend: 'Incomplete', color: 'amber' },
  ]

  const recentApplications = [
    { company: 'TechCorp', role: 'Senior React Developer', status: 'Applied', date: '2 days ago', color: 'bg-amber-500' },
    { company: 'DataFlow', role: 'Full Stack Engineer', status: 'Interview', date: '5 days ago', color: 'bg-secondary-500' },
    { company: 'DesignHub', role: 'Product Designer', status: 'Rejected', date: '1 week ago', color: 'bg-red-500' },
    { company: 'AI Labs', role: 'Data Scientist', status: 'Shortlisted', date: '1 week ago', color: 'bg-primary-500' },
    { company: 'NovaWorks', role: 'Frontend Engineer', status: 'Hired', date: '2 weeks ago', color: 'bg-emerald-500' },
  ]

  const hiringFunnel = [
    { label: 'Applied', count: 12, color: 'bg-amber-500' },
    { label: 'Shortlisted', count: 7, color: 'bg-primary-500' },
    { label: 'Interview', count: 3, color: 'bg-secondary-500' },
    { label: 'Hired', count: 1, color: 'bg-emerald-500' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Candidate Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Welcome back! Here's your job search overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hiring Funnel</h2>
              <Link to="/dashboard/applications" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {hiringFunnel.map((step, index) => (
                <div key={step.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${step.color}`} />
                      <span className="font-medium text-slate-700 dark:text-slate-200">{step.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{step.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${step.color}`}
                      style={{ width: `${Math.max(15, (step.count / Math.max(...hiringFunnel.map(item => item.count), 1)) * 100)}%` }}
                    />
                  </div>
                  {index < hiringFunnel.length - 1 && <div className="text-[10px] text-slate-400 text-center">→</div>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
              <Link to="/dashboard/applications" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentApplications.map((app, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {app.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{app.role}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{app.company} · {app.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    app.status === 'Interview' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' :
                    app.status === 'Rejected' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                    app.status === 'Shortlisted' ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400' :
                    app.status === 'Hired' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                  }`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI Recommendations</h2>
              <Link to="/dashboard/ai-tools" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                View All <HiOutlineArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { title: 'ATS Score: 85/100', desc: 'Your resume scores well. Improve keyword density to reach 90+.', icon: HiOutlineChartBar, color: 'from-primary-500 to-primary-600' },
                { title: 'Resume Summary Ready', desc: 'Generate an AI-powered professional summary for your profile.', icon: HiOutlineSparkles, color: 'from-amber-500 to-amber-600' },
                { title: 'Jobs Match: React Developer', desc: '3 new positions match your profile. Apply now!', icon: HiOutlineBriefcase, color: 'from-secondary-500 to-secondary-600' },
              ].map((rec, i) => {
                const Icon = rec.icon
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rec.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{rec.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{rec.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
