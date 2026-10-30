import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineCheckBadge, HiOutlineXMark } from 'react-icons/hi2'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/forever',
    description: 'Perfect for getting started with your job search',
    features: [
      { included: true, text: 'Create profile & upload resume' },
      { included: true, text: 'Search and apply to jobs' },
      { included: true, text: 'Basic AI job matching' },
      { included: true, text: 'Save up to 20 jobs' },
      { included: false, text: 'ATS Score & resume optimization' },
      { included: false, text: 'AI cover letter generator' },
      { included: false, text: 'Priority support' },
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious job seekers who want an edge',
    features: [
      { included: true, text: 'Everything in Free' },
      { included: true, text: 'Unlimited job saves' },
      { included: true, text: 'Advanced AI matching' },
      { included: true, text: 'ATS Score & resume optimization' },
      { included: true, text: 'AI cover letter generator' },
      { included: true, text: 'Interview question generator' },
      { included: true, text: 'Priority support' },
    ],
    cta: 'Start Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For teams and power users',
    features: [
      { included: true, text: 'Everything in Pro' },
      { included: true, text: 'Unlimited applications' },
      { included: true, text: 'AI career assistant chatbot' },
      { included: true, text: 'Personalized job recommendations' },
      { included: true, text: 'Resume review by experts' },
      { included: true, text: 'Salary insights & negotiation tips' },
      { included: true, text: 'Dedicated account manager' },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Choose the plan that's right for your career journey. No hidden fees, cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass-card p-8 ${plan.popular ? 'ring-2 ring-primary-500 shadow-xl shadow-primary-500/10 scale-105' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    {f.included ? (
                      <HiOutlineCheckBadge className="w-5 h-5 text-secondary-500 shrink-0 mt-0.5" />
                    ) : (
                      <HiOutlineXMark className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span className={f.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
