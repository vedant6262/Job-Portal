import { motion } from 'framer-motion'
import { HiOutlineCalendar, HiOutlineVideoCamera, HiOutlineMapPin, HiOutlineClock, HiOutlineCheckBadge, HiOutlineXMark } from 'react-icons/hi2'

const interviews = [
  { id: 1, company: 'TechCorp', role: 'Senior React Developer', type: 'Video Call', date: '2024-03-20', time: '10:00 AM', status: 'Confirmed', link: 'https://meet.google.com/abc-defg-hij' },
  { id: 2, company: 'DataFlow', role: 'Full Stack Engineer', type: 'On-site', date: '2024-03-22', time: '2:00 PM', status: 'Pending', location: '123 Market St, San Francisco' },
  { id: 3, company: 'DesignHub', role: 'Product Designer', type: 'Technical Test', date: '2024-03-25', time: 'Flexible', status: 'Scheduled' },
]

export default function InterviewSchedule() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Interview Schedule</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your upcoming interviews.</p>

      <div className="space-y-4">
        {interviews.map((interview, i) => (
          <motion.div
            key={interview.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{interview.role}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{interview.company}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                interview.status === 'Confirmed' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' :
                interview.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
              }`}>
                {interview.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><HiOutlineCalendar className="w-4 h-4" /> {interview.date}</span>
              <span className="flex items-center gap-1.5"><HiOutlineClock className="w-4 h-4" /> {interview.time}</span>
              <span className="flex items-center gap-1.5">
                {interview.type === 'Video Call' ? <HiOutlineVideoCamera className="w-4 h-4" /> : <HiOutlineMapPin className="w-4 h-4" />}
                {interview.type}
              </span>
            </div>

            {interview.link && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Meeting Link:</p>
                <a href={interview.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">{interview.link}</a>
              </div>
            )}

            {interview.location && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Location:</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{interview.location}</p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button className="btn-primary px-4 py-2 text-xs"><HiOutlineCheckBadge className="w-4 h-4" /> Confirm</button>
              <button className="btn-ghost px-4 py-2 text-xs text-red-500"><HiOutlineXMark className="w-4 h-4" /> Decline</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
