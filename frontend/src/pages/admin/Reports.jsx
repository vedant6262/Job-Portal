import { motion } from 'framer-motion'
import { HiOutlineExclamationTriangle, HiOutlineFlag, HiOutlineUserGroup, HiOutlineBriefcase } from 'react-icons/hi2'

const reports = [
  { id: 1, type: 'Fake Job', company: 'FakeCompany', reportedBy: 'User123', date: '2 hours ago', status: 'Pending' },
  { id: 2, type: 'Spam', company: 'SpamCorp', reportedBy: 'User456', date: '1 day ago', status: 'Resolved' },
  { id: 3, type: 'Scam', company: 'ScamLLC', reportedBy: 'User789', date: '3 days ago', status: 'Under Review' },
  { id: 4, type: 'Inappropriate Content', company: 'BadCo', reportedBy: 'User012', date: '1 week ago', status: 'Pending' },
]

export default function Reports() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Reports</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Review flagged content and user reports.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: HiOutlineExclamationTriangle, label: 'Pending Reports', value: '12', color: 'from-amber-500 to-amber-600' },
          { icon: HiOutlineFlag, label: 'Resolved', value: '45', color: 'from-secondary-500 to-secondary-600' },
          { icon: HiOutlineUserGroup, label: 'Flagged Users', value: '8', color: 'from-rose-500 to-rose-600' },
          { icon: HiOutlineBriefcase, label: 'Flagged Jobs', value: '23', color: 'from-primary-500 to-primary-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Reports</h2>
        <div className="space-y-3">
          {reports.map((report, i) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
            >
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <HiOutlineFlag className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{report.type}</p>
                <p className="text-xs text-slate-500">{report.company} · Reported by {report.reportedBy}</p>
                <p className="text-xs text-slate-400">{report.date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                report.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                report.status === 'Resolved' ? 'bg-secondary-50 text-secondary-600' :
                'bg-primary-50 text-primary-600'
              }`}>
                {report.status}
              </span>
              <button className="btn-ghost p-1.5">View</button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
