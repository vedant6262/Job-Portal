import { motion } from 'framer-motion'
import { HiOutlineBriefcase, HiOutlineUsers, HiOutlineCheckBadge, HiOutlineChartBar, HiOutlineArrowTrendingUp, HiOutlineClock } from 'react-icons/hi2'
import StatCard from '../../components/ui/StatCard'

const monthlyData = [
  { month: 'Jan', applications: 45, hires: 3 },
  { month: 'Feb', applications: 52, hires: 5 },
  { month: 'Mar', applications: 38, hires: 2 },
  { month: 'Apr', applications: 65, hires: 7 },
  { month: 'May', applications: 72, hires: 8 },
  { month: 'Jun', applications: 58, hires: 6 },
]

const jobStats = [
  { title: 'Senior React Developer', views: 234, applications: 15, shortlisted: 4, hired: 1 },
  { title: 'Full Stack Engineer', views: 189, applications: 23, shortlisted: 6, hired: 2 },
  { title: 'Product Designer', views: 156, applications: 8, shortlisted: 2, hired: 0 },
]

export default function Analytics() {
  const maxApplications = Math.max(...monthlyData.map(d => d.applications))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Hiring Analytics</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Track your hiring performance and metrics.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={HiOutlineBriefcase} label="Total Jobs" value="8" trend="+2 this month" color="primary" />
        <StatCard icon={HiOutlineUsers} label="Total Applicants" value="187" trend="+45 this month" color="violet" />
        <StatCard icon={HiOutlineCheckBadge} label="Hired" value="18" trend="+5 this month" color="secondary" />
        <StatCard icon={HiOutlineChartBar} label="Conversion Rate" value="9.6%" trend="+2.1% this month" color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Monthly Overview</h2>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-primary-500/20 rounded-t transition-all duration-500"
                    style={{ height: `${(d.applications / maxApplications) * 100}%` }}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-500"
                      style={{ height: `${(d.hires / d.applications) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-500" /> Applications</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-300" /> Hires</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Job Performance</h2>
          <div className="space-y-4">
            {jobStats.map((job, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{job.title}</p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div><p className="font-semibold text-slate-900 dark:text-white">{job.views}</p><p className="text-slate-500">Views</p></div>
                  <div><p className="font-semibold text-slate-900 dark:text-white">{job.applications}</p><p className="text-slate-500">Applied</p></div>
                  <div><p className="font-semibold text-slate-900 dark:text-white">{job.shortlisted}</p><p className="text-slate-500">Shortlisted</p></div>
                  <div><p className="font-semibold text-slate-900 dark:text-white">{job.hired}</p><p className="text-slate-500">Hired</p></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
