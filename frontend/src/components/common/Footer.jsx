import { Link } from 'react-router-dom'
import { HiOutlineBriefcase, HiOutlineHeart, HiOutlineShieldCheck } from 'react-icons/hi2'

const footerLinks = {
  company: [
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/faq', label: 'FAQ' },
  ],
  candidates: [
    { to: '/jobs', label: 'Browse Jobs' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dashboard/saved-jobs', label: 'Saved Jobs' },
    { to: '/dashboard/ai-tools', label: 'AI Tools' },
  ],
  employers: [
    { to: '/recruiter/post-job', label: 'Post a Job' },
    { to: '/recruiter', label: 'Recruiter Dashboard' },
    { to: '/recruiter/analytics', label: 'Analytics' },
    { to: '/recruiter/company', label: 'Company Profile' },
  ],
  legal: [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms & Conditions' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <HiOutlineBriefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">JobPortal</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Find your dream job with AI-powered matching. Join millions of job seekers and employers.
            </p>
            <div className="flex gap-3">
              {['Twitter', 'LinkedIn', 'GitHub'].map(social => (
                <a key={social} href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all duration-300 text-xs font-medium">
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 capitalize">
                {key === 'company' ? 'Company' : key === 'candidates' ? 'For Candidates' : key === 'employers' ? 'For Employers' : 'Legal'}
              </h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
