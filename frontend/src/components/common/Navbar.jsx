import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, useUser, SignUpButton } from '../../context/AuthProvider'
import { useTheme } from '../../context/ThemeContext'
import {
  HiOutlineBriefcase, HiOutlineBars3, HiOutlineXMark, HiOutlineMoon, HiOutlineSun,
  HiOutlineChevronDown, HiOutlineUser, HiOutlineBuildingOffice2, HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'

const publicNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
]

const loggedInPublicLinks = []

const privateNavLinks = []

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isSignedIn, signOut } = useAuth()
  const { user } = useUser()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    setDropdownOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/'
    const role = user.publicMetadata?.role || 'candidate'
    return role === 'candidate' ? '/dashboard' : role === 'recruiter' ? '/recruiter' : '/admin'
  }

  const navLinks = publicNavLinks

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <HiOutlineBriefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">JobPortal</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost p-2.5 hidden sm:flex">
              {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>

            {isSignedIn ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <img src={user?.imageUrl} alt="" className="w-8 h-8 rounded-full ring-2 ring-primary-500/20" />
                  <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {user?.fullName}
                  </span>
                  <HiOutlineChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-56 glass-card p-2 z-20"
                      >
                        <Link
                          to={getDashboardLink()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                          <HiOutlineUser className="w-5 h-5" />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                          <HiOutlineCog6Tooth className="w-5 h-5" />
                          Settings
                        </Link>
                        <hr className="my-1 border-slate-200 dark:border-slate-700" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition-all"
                        >
                          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost px-4 py-2 text-sm">Sign In</Link>
                <Link to="/recruiter/login" className="btn-ghost px-4 py-2 text-sm">Recruiter Login</Link>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <button className="btn-primary px-5 py-2 text-sm">Get Started</button>
                </SignUpButton>
              </div>
            )}

            <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2.5 lg:hidden">
              <HiOutlineBars3 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-slate-800 z-50 shadow-2xl"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-lg gradient-text">Menu</span>
                  <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2">
                    <HiOutlineXMark className="w-6 h-6" />
                  </button>
                </div>

                {!isSignedIn && (
                  <div className="flex flex-col gap-2 mb-6">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full justify-center">Sign In</Link>
                    <Link to="/recruiter/login" onClick={() => setMobileOpen(false)} className="btn-ghost w-full justify-center">Recruiter Login</Link>
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                      <button className="btn-primary w-full justify-center">Get Started</button>
                    </SignUpButton>
                  </div>
                )}

                <nav className="space-y-1">
                  {navLinks.map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === link.to
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <hr className="my-4 border-slate-200 dark:border-slate-700" />

                {isSignedIn && (
                  <div className="space-y-1">
                    <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <HiOutlineUser className="w-5 h-5" /> Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
