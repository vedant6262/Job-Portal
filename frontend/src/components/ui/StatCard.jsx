import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, trend, color = 'primary' }) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/25',
    secondary: 'from-secondary-500 to-secondary-600 shadow-secondary-500/25',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/25',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/25',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {trend && (
            <p className={`text-xs mt-1 ${trend.startsWith('+') ? 'text-secondary-500' : 'text-red-500'}`}>
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}
