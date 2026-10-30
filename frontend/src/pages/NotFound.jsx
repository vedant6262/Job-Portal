import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineHome } from 'react-icons/hi2'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-8xl font-extrabold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <HiOutlineHome className="w-5 h-5" />
          Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
