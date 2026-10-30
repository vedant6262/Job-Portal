import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../utils/api'

export default function PortalHub() {
  const location = useLocation()
  const view = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('view') || 'internships'
  }, [location.search])

  const [opportunities, setOpportunities] = useState([])
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [internshipsRes, programsRes] = await Promise.all([
          api.get('/portal/internships'),
          api.get('/portal/programs'),
        ])
        setOpportunities(internshipsRes.data.opportunities || [])
        setPrograms(programsRes.data.programs || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const list = view === 'learning' ? programs : opportunities

  if (loading) {
    return <div className="page-heading">Loading opportunities...</div>
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Academia–Industry Network</p>
          <h1 className="page-heading mt-3">{view === 'learning' ? 'Learning & certification programs' : 'Internship & placement opportunities'}</h1>
        </div>
        <div className="flex gap-2">
          <a href="/internships" className={`rounded-full px-4 py-2 text-sm font-medium ${view === 'internships' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            Internships
          </a>
          <a href="/internships?view=learning" className={`rounded-full px-4 py-2 text-sm font-medium ${view === 'learning' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
            Learning
          </a>
        </div>
      </div>

      <div className="grid gap-6">
        {list.map((item) => (
          <div key={item.id} className="glass-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                  {view === 'learning' ? item.provider : item.company}
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
              <button type="button" className="btn-primary whitespace-nowrap">{view === 'learning' ? 'Join program' : 'Apply now'}</button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {view === 'learning' ? (
                <>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.format}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.duration}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.level}</span>
                </>
              ) : (
                <>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.type}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.mode}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">{item.location}</span>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(view === 'learning' ? item.skills : item.skills || []).map((skill) => (
                <span key={skill} className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-500/10 dark:text-primary-300">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
