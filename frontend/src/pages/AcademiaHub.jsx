import { useEffect, useState } from 'react'
import api from '../utils/api'

export default function AcademiaHub() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/portal/academia')
        setOpportunities(data.opportunities || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <div className="page-heading">Loading academic opportunities...</div>

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Academician Opportunities</p>
        <h1 className="page-heading mt-3">Faculty internships, training, and research collaboration</h1>
      </div>

      <div className="grid gap-6">
        {opportunities.map((item) => (
          <div key={item.id} className="glass-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{item.type}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.organization}</p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
              <button type="button" className="btn-secondary whitespace-nowrap">Explore opportunity</button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.location}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.duration}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {item.focus.map((focus) => (
                <span key={focus} className="rounded-full border border-secondary-200 bg-secondary-50 px-3 py-1 text-xs font-medium text-secondary-700 dark:border-secondary-800 dark:bg-secondary-500/10 dark:text-secondary-300">{focus}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
