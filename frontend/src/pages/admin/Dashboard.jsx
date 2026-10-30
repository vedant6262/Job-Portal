import { motion } from 'framer-motion'
import {
  HiOutlineUsers, HiOutlineShieldCheck, HiOutlineBuildingOffice2, HiOutlineBriefcase,
  HiOutlineChartBar, HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'
import StatCard from '../../components/ui/StatCard'

const monthlyStats = [
  { month: 'Jan', users: 1200, jobs: 450 },
  { month: 'Feb', users: 1800, jobs: 520 },
  { month: 'Mar', users: 2400, jobs: 680 },
  { month: 'Apr', users: 3100, jobs: 750 },
  { month: 'May', users: 3800, jobs: 890 },
  { month: 'Jun', users: 4500, jobs: 1020 },
]

export default function AdminDashboard() {
  const maxValue = Math.max(...monthlyStats.map(d => Math.max(d.users, d.jobs)))

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Admin Dashboard</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Monitor platform performance and manage users.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={HiOutlineUsers} label="Total Users" value="12,847" trend="+1,240 this month" color="primary" />
        <StatCard icon={HiOutlineShieldCheck} label="Recruiters" value="1,234" trend="+89 this month" color="violet" />
        <StatCard icon={HiOutlineBuildingOffice2} label="Companies" value="5,678" trend="+234 this month" color="amber" />
        <StatCard icon={HiOutlineBriefcase} label="Total Jobs" value="10,456" trend="+567 this month" color="secondary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Platform Growth</h2>
          <div className="flex items-end gap-3 h-48">
            {monthlyStats.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-0.5">
                  <div className="w-full bg-primary-500/20 rounded-t" style={{ height: `${(d.users / maxValue) * 100}%` }}>
                    <div className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all" style={{ height: `${(d.jobs / d.users) * 100}%` }} />
                  </div>
                </div>
                <span className="text-xs text-slate-500">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-500" /> Users</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-300" /> Jobs</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Quick Stats</h2>
          <div className="space-y-4">
            {[
              { label: 'Active Users', value: '8,234', trend: '+5%', icon: HiOutlineArrowTrendingUp },
              { label: 'Pending Approvals', value: '47', trend: 'Needs review', icon: HiOutlineShieldCheck },
              { label: 'Reports Flagged', value: '12', trend: 'Resolve soon', icon: HiOutlineChartBar },
              { label: 'New Today', value: '156', trend: '+12%', icon: HiOutlineUsers },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{stat.trend}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
