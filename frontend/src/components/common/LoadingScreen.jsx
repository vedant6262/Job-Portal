import { motion } from 'framer-motion'
import { HiOutlineBriefcase } from 'react-icons/hi2'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/25"
        >
          <HiOutlineBriefcase className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading...</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Please wait a moment</p>
      </motion.div>
    </div>
  )
}
