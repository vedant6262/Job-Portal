import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  HiOutlineSparkles, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineAcademicCap,
  HiOutlineBriefcase, HiOutlineClipboardDocumentList, HiOutlineArrowPath, HiOutlineArrowUpTray,
  HiOutlineArrowTopRightOnSquare, HiOutlineXMark,
} from 'react-icons/hi2'
import api from '../../utils/api'

const tools = [
  { id: 'ats', name: 'ATS Score Checker', description: 'Upload your resume to get a score and matched jobs', icon: HiOutlineDocumentText, color: 'from-primary-500 to-primary-600' },
  { id: 'recommendations', name: 'Personalized Recommendations', description: 'Get AI-matched job recommendations', icon: HiOutlineBriefcase, color: 'from-rose-500 to-rose-600' },
  { id: 'career', name: 'Career Path Advisor', description: 'Explore optimal career paths based on your profile', icon: HiOutlineAcademicCap, color: 'from-cyan-500 to-cyan-600' },
]

const sampleResults = {
  recommendations: ['Senior React Developer at Google', 'Full Stack Engineer at Stripe', 'Technical Lead at Shopify'],
  career: 'Based on your profile, you could progress to: Staff Engineer → Engineering Manager → Director of Engineering → CTO',
}

export default function AITools() {
  const [searchParams] = useSearchParams()
  const [selected, setSelected] = useState(searchParams.get('tool') || 'ats')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [summary, setSummary] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    const tool = searchParams.get('tool')
    if (tool && tools.some(t => t.id === tool)) {
      setSelected(tool)
      setResult(null)
      setAnalysis(null)
      setSummary('')
      setCoverLetter('')
    }
  }, [searchParams])

  const handleGenerate = async () => {
    if (selected === 'summary' || selected === 'cover') {
      if (!resumeText) {
        toast.error('Upload and analyze your resume first')
        return
      }
      if (selected === 'cover' && (!jobTitle.trim() || !companyName.trim())) {
        toast.error('Enter the job title and company name first')
        return
      }
      setLoading(true)
      try {
        if (selected === 'summary') {
          const { data } = await api.post('/ai/resume-summary', { resumeText })
          setSummary(data.summary)
        } else {
          const { data } = await api.post('/ai/cover-letter', {
            resumeText,
            jobTitle: jobTitle.trim(),
            companyName: companyName.trim(),
            jobDescription: jobDescription.trim(),
          })
          setCoverLetter(data.coverLetter)
        }
        toast.success(selected === 'summary' ? 'Summary generated' : 'Cover letter generated')
      } catch (error) {
        toast.error(error.message || 'AI generation failed')
      } finally {
        setLoading(false)
      }
      return
    }
    setLoading(true)
    setTimeout(() => {
      setResult(sampleResults[selected])
      setLoading(false)
    }, 1500)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setResumeFile(file)
  }

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file first')
      return
    }
    setLoading(true)
    setAnalysis(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim())
      const { data } = await api.post('/ai/analyze-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      setAnalysis(data)
      setResumeText(data.resumeText)
      setSummary('')
      setCoverLetter('')
      const summaryResponse = await api.post('/ai/resume-summary', { resumeText: data.resumeText })
      setSummary(summaryResponse.data.summary)
      toast.success('Resume analyzed and summary generated')
    } catch (error) {
      toast.error(error.message || 'Failed to analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const Tool = tools.find(t => t.id === selected)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">AI Tools</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Leverage AI to supercharge your job search.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {tools.map(tool => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              onClick={() => { setSelected(tool.id); setResult(null); setAnalysis(null) }}
              className={`glass-card p-4 text-center transition-all duration-300 ${
                selected === tool.id ? 'ring-2 ring-primary-500 shadow-lg shadow-primary-500/10' : 'hover:shadow-lg'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium text-slate-900 dark:text-white">{tool.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-tight">{tool.description}</p>
            </button>
          )
        })}
      </div>

      <motion.div key={selected} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{Tool?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{Tool?.description}</p>
          </div>
          {selected !== 'ats' && selected !== 'summary' && selected !== 'cover' && (
            <button onClick={handleGenerate} disabled={loading} className="btn-primary">
              <HiOutlineSparkles className="w-5 h-5" />
              {loading ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>

        {selected === 'ats' ? (
          <div className="space-y-5">
            <div>
              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 cursor-pointer hover:border-primary-500 hover:bg-primary-50/40 dark:hover:bg-primary-500/5 transition-all">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {resumeFile ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <HiOutlineDocumentText className="w-6 h-6 text-primary-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{resumeFile.name}</p>
                      <p className="text-xs text-slate-500">{(resumeFile.size / 1024).toFixed(1)} KB · Click to change</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null) }}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                    >
                      <HiOutlineXMark className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <HiOutlineArrowUpTray className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload your resume</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, DOCX, or TXT · up to 10 MB</p>
                    </div>
                  </>
                )}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Job Description <span className="text-slate-400 font-normal">(optional — improves scoring accuracy)</span>
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste a job description to check how well your resume matches the role..."
                className="input-field resize-none"
              />
            </div>

            <div className="flex items-center justify-end">
              <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
                {loading ? <HiOutlineArrowPath className="w-5 h-5 animate-spin" /> : <HiOutlineDocumentText className="w-5 h-5" />}
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>

            {loading && (
              <div className="space-y-3 mt-4">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-4 w-1/2 skeleton" />
                <div className="h-4 w-2/3 skeleton" />
              </div>
            )}

            {analysis && !loading && (
              <div className="space-y-6 mt-4">
                {summary && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">AI Resume Summary</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{summary}</p>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-5xl font-bold gradient-text mb-2">{analysis.ats.score}/100</div>
                  <p className="text-sm text-slate-500">ATS Compatibility Score</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mt-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.ats.score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Skills Found</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.length > 0 ? analysis.skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                          {skill}
                        </span>
                      )) : <p className="text-sm text-slate-500">No known skills detected.</p>}
                    </div>
                  </div>
                  {analysis.ats.missingKeywords?.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.ats.missingKeywords.map(kw => (
                          <span key={kw} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Improvement Suggestions</h4>
                  <ul className="space-y-2">
                    {analysis.ats.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">Matched Jobs For You</h4>
                    <span className="text-xs text-slate-500">{analysis.matchedJobs.length} matches</span>
                  </div>
                  {analysis.matchedJobs.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.matchedJobs.map((job, i) => (
                        <a
                          key={i}
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-primary-50 dark:hover:bg-primary-500/5 border border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{job.title}</p>
                                <HiOutlineArrowTopRightOnSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{job.company} · {job.location}{job.remote ? ' · Remote' : ''}</p>
                              {job.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {job.tags.slice(0, 5).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{job.matchScore}%</span>
                              <span className="text-[10px] text-slate-400">match</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No matching jobs found right now. Try adding more skills or a job description.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {(selected === 'summary' || selected === 'cover') && (
              <div className="space-y-4 mb-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload and analyze a resume in ATS Score Checker first.</p>
                {selected === 'cover' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Job title" className="input-field" />
                    <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Company name" className="input-field" />
                  </div>
                )}
                <button onClick={handleGenerate} disabled={loading || !resumeText} className="btn-primary">
                  <HiOutlineSparkles className="w-5 h-5" />
                  {loading ? 'Generating...' : selected === 'summary' ? 'Generate Summary' : 'Generate Cover Letter'}
                </button>
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-4 w-1/2 skeleton" />
                <div className="h-4 w-2/3 skeleton" />
              </div>
            )}

            {(result || summary || coverLetter) && !loading && (
              <div className="space-y-4">
                <div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <pre className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans">
                      {coverLetter || summary || result?.cover || result?.summary || result?.career ||
                       (result.questions && result.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')) ||
                       (result.recommendations && result.recommendations.join('\n'))}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
