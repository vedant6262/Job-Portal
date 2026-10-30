import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineExclamationCircle } from 'react-icons/hi2'

const users = [
  { id: 1, name: 'John Doe', email: 'john@email.com', role: 'Candidate', joined: 'Jan 15, 2024', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@email.com', role: 'Recruiter', joined: 'Feb 3, 2024', status: 'Active' },
  { id: 3, name: 'Bob Wilson', email: 'bob@email.com', role: 'Candidate', joined: 'Mar 22, 2024', status: 'Suspended' },
  { id: 4, name: 'Alice Brown', email: 'alice@email.com', role: 'Recruiter', joined: 'Apr 10, 2024', status: 'Pending' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@email.com', role: 'Candidate', joined: 'May 5, 2024', status: 'Active' },
]

export default function ManageUsers() {
  const [search, setSearch] = useState('')

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all platform users.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 glass-card px-4 py-3 mb-6">
        <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-transparent border-none outline-none text-sm w-full" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">User</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">Joined</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.joined}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      user.status === 'Active' ? 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/10 dark:text-secondary-400' :
                      user.status === 'Suspended' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn-ghost p-1.5"><HiOutlineExclamationCircle className="w-4 h-4" /></button>
                      <button className="btn-ghost p-1.5 text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
