import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineClock, HiOutlineLightBulb, HiOutlineSparkles } from 'react-icons/hi2'
import api from '../../utils/api'

const categories = [{ value: 'mixed', label: 'Mixed' }, { value: 'quantitative', label: 'Quantitative Aptitude' }, { value: 'logical', label: 'Logical Reasoning' }, { value: 'verbal', label: 'Verbal Ability' }]
const difficulties = [{ value: 'mixed', label: 'Mixed' }, { value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]
const questionCounts = [10, 20, 30, 50]

export default function AptitudePrep() {
  const [companies, setCompanies] = useState([])
  const [config, setConfig] = useState({ companyId: '', category: 'mixed', difficulty: 'mixed', questionCount: 10, practiceMode: false })
  const [screen, setScreen] = useState('setup')
  const [session, setSession] = useState(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [review, setReview] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [startedAt, setStartedAt] = useState(null)
  const [result, setResult] = useState(null)
  const [details, setDetails] = useState(null)
  const [progress, setProgress] = useState(null)
  const [aiAnswer, setAiAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const company = companies.find(item => item.id === config.companyId)
  const question = session?.questions?.[current]
  const answeredCount = Object.keys(answers).length
  const topics = useMemo(() => [...new Set((session?.questions || []).map(item => item.topic))], [session])

  useEffect(() => {
    api.get('/aptitude/companies').then(({ data }) => { setCompanies(data); if (data[0]) setConfig(item => ({ ...item, companyId: data[0].id })) }).catch(error => toast.error(error.message))
  }, [])

  useEffect(() => {
    if (!config.companyId) return
    api.get('/aptitude/progress', { params: { companyId: config.companyId } }).then(({ data }) => setProgress(data)).catch(() => {})
  }, [config.companyId])

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0 || screen !== 'test') return undefined
    const timer = window.setInterval(() => setSecondsLeft(value => value - 1), 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft, screen])

  useEffect(() => {
    if (secondsLeft === 0 && screen === 'test') { toast.error('Time is up. Submitting your test.'); submitTest() }
  }, [secondsLeft, screen])

  const startTest = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/aptitude/test/start', config)
      setSession(data); setAnswers({}); setReview({}); setCurrent(0); setStartedAt(Date.now()); setSecondsLeft(data.durationSeconds); setScreen('test')
    } catch (error) { toast.error(error.message) }
    finally { setLoading(false) }
  }

  const submitTest = async () => {
    if (!session || loading) return
    setLoading(true)
    try {
      const payload = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }))
      const { data } = await api.post('/aptitude/test/submit', { sessionId: session.sessionId, answers: payload, timeTaken: Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) })
      setResult(data); setScreen('result'); setSecondsLeft(null)
    } catch (error) { toast.error(error.message) }
    finally { setLoading(false) }
  }

  const openReview = async () => {
    setLoading(true)
    try { const { data } = await api.get(`/aptitude/test/${result.sessionId}`); setDetails(data); setScreen('review') } catch (error) { toast.error(error.message) }
    finally { setLoading(false) }
  }

  const explain = async questionId => {
    setAiAnswer('Groq is preparing an explanation...')
    try { const { data } = await api.post('/aptitude/ai/explain', { questionId }); setAiAnswer(data.answer) } catch (error) { setAiAnswer(error.message) }
  }

  const formatTime = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  const selectedCompany = session?.company?.name || company?.name || 'Company'

  if (screen === 'test' && session) return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary-600">{selectedCompany} Aptitude Test</p><h1 className="page-heading mt-1">Question {current + 1} <span className="text-slate-400">of {session.questions.length}</span></h1></div>{secondsLeft !== null && <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${secondsLeft < 60 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}><HiOutlineClock className="h-5 w-5" />{formatTime(secondsLeft)}</div>}</div>
    <div className="grid gap-5 lg:grid-cols-[1fr_250px]"><div className="glass-card p-5 sm:p-7"><div className="mb-5 flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded bg-primary-50 px-2 py-1 text-primary-700">{question.category}</span><span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-700">{question.topic}</span><span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-700">{question.difficulty}</span></div><h2 className="text-xl font-semibold leading-relaxed text-slate-900 dark:text-white">{question.question}</h2><div className="mt-7 space-y-3">{Object.entries(question.options).map(([key, value]) => <button key={key} onClick={() => setAnswers(currentAnswers => ({ ...currentAnswers, [question.id]: key }))} className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition ${answers[question.id] === key ? 'border-primary-500 bg-primary-50 text-primary-800 dark:bg-primary-500/10 dark:text-primary-300' : 'border-slate-200 hover:border-primary-300 dark:border-slate-700'}`}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold">{key}</span><span>{value}</span></button>)}</div><div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-700"><div className="flex gap-2"><button onClick={() => setAnswers(currentAnswers => { const copy = { ...currentAnswers }; delete copy[question.id]; return copy })} className="btn-secondary text-xs">Clear Answer</button><button onClick={() => setReview(currentReview => ({ ...currentReview, [question.id]: !currentReview[question.id] }))} className={`btn-secondary text-xs ${review[question.id] ? 'border-amber-400 text-amber-600' : ''}`}><HiOutlineLightBulb className="h-4 w-4" />{review[question.id] ? 'Marked' : 'Mark for Review'}</button></div><div className="flex gap-2"><button disabled={current === 0} onClick={() => setCurrent(value => value - 1)} className="btn-secondary text-xs"><HiOutlineArrowLeft className="h-4 w-4" />Previous</button>{current === session.questions.length - 1 ? <button onClick={submitTest} disabled={loading} className="btn-primary text-xs">{loading ? 'Submitting...' : 'Submit Test'}</button> : <button onClick={() => setCurrent(value => value + 1)} className="btn-primary text-xs">Next<HiOutlineArrowRight className="h-4 w-4" /></button>}</div></div></div><aside className="glass-card h-fit p-5"><h3 className="font-semibold text-slate-900 dark:text-white">Question Navigator</h3><div className="mt-4 grid grid-cols-5 gap-2">{session.questions.map((item, index) => <button key={item.id} onClick={() => setCurrent(index)} className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-bold ${index === current ? 'bg-slate-900 text-white' : answers[item.id] ? 'bg-emerald-100 text-emerald-700' : review[item.id] ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>{index + 1}{answers[item.id] && <HiOutlineCheckCircle className="absolute -right-1 -top-1 h-3 w-3" />}</button>)}</div><p className="mt-5 text-xs text-slate-500">{answeredCount} answered · {Object.keys(review).length} marked</p></aside></div>
  </div>

  if (screen === 'result' && result) return <div className="mx-auto max-w-4xl space-y-6"><div className="glass-card overflow-hidden"><div className="bg-slate-950 px-6 py-8 text-white sm:px-10"><p className="text-xs font-semibold uppercase tracking-widest text-primary-300">Test complete</p><h1 className="mt-2 text-2xl font-bold">{result.company} Aptitude Test</h1><div className="mt-7 flex flex-wrap items-end gap-5"><div className="text-6xl font-bold text-primary-300">{result.percentage}%</div><div className="pb-2 text-sm text-slate-300">{result.score} / {result.score + result.wrongAnswers + result.unanswered} correct</div></div></div><div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-700 sm:grid-cols-4"><div className="bg-white p-5 dark:bg-slate-800"><p className="text-xs text-slate-500">Correct</p><p className="mt-1 text-2xl font-bold text-emerald-600">{result.correctAnswers}</p></div><div className="bg-white p-5 dark:bg-slate-800"><p className="text-xs text-slate-500">Wrong</p><p className="mt-1 text-2xl font-bold text-rose-600">{result.wrongAnswers}</p></div><div className="bg-white p-5 dark:bg-slate-800"><p className="text-xs text-slate-500">Unanswered</p><p className="mt-1 text-2xl font-bold text-amber-600">{result.unanswered}</p></div><div className="bg-white p-5 dark:bg-slate-800"><p className="text-xs text-slate-500">Time Taken</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatTime(result.timeTaken || 0)}</p></div></div></div><div className="flex flex-wrap gap-3"><button onClick={openReview} disabled={loading} className="btn-primary">Review Answers</button><button onClick={() => { setResult(null); setSession(null); setScreen('setup') }} className="btn-secondary">Practice Again</button></div><p className="text-xs text-slate-500">Questions are collected from publicly available or original practice resources. Actual company assessments may vary.</p></div>

  if (screen === 'review' && details) return <div className="space-y-5"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Answer review</p><h1 className="page-heading mt-1">{details.company.name} Aptitude Test</h1></div><button onClick={() => setScreen('result')} className="btn-secondary text-xs"><HiOutlineArrowLeft className="h-4 w-4" />Back to result</button></div>{details.answers.map((item, index) => <div key={item.questionId} className="glass-card p-5"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-slate-900 dark:text-white">Question {index + 1}: {item.question}</h2><span className={item.isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{item.isCorrect ? 'Correct' : 'Incorrect'}</span></div><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><p>Your answer: <strong>{item.selectedAnswer || 'Unanswered'}{item.selectedAnswer ? `. ${item.options[item.selectedAnswer]}` : ''}</strong></p><p>Correct answer: <strong>{item.correctAnswer}. {item.options[item.correctAnswer]}</strong></p></div><p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">{item.explanation}</p><button onClick={() => explain(item.questionId)} className="btn-secondary mt-4 text-xs"><HiOutlineSparkles className="h-4 w-4" />Explain with AI</button>{aiAnswer && <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-xs text-slate-100">{aiAnswer}</pre>}</div>)}</div>

  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Placement practice</p><h1 className="page-heading mt-1">Company-Wise Aptitude</h1><p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Build speed and accuracy with focused quantitative, logical, and verbal practice.</p></div><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><div className="glass-card p-6"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Configure your test</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company<select value={config.companyId} onChange={event => setConfig({ ...config, companyId: event.target.value })} className="input-field mt-2">{companies.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category<select value={config.category} onChange={event => setConfig({ ...config, category: event.target.value })} className="input-field mt-2">{categories.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty<select value={config.difficulty} onChange={event => setConfig({ ...config, difficulty: event.target.value })} className="input-field mt-2">{difficulties.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Number of Questions<select value={config.questionCount} onChange={event => setConfig({ ...config, questionCount: Number(event.target.value) })} className="input-field mt-2">{questionCounts.map(value => <option key={value}>{value}</option>)}</select></label></div><label className="mt-5 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={config.practiceMode} onChange={event => setConfig({ ...config, practiceMode: event.target.checked })} className="h-4 w-4 accent-primary-600" />Practice Mode <span className="text-xs text-slate-400">No countdown timer</span></label><button onClick={startTest} disabled={loading || !config.companyId} className="btn-primary mt-6 w-full sm:w-auto"><HiOutlineCheckCircle className="h-5 w-5" />{loading ? 'Preparing...' : 'Start Aptitude Test'}</button><p className="mt-4 text-xs text-slate-500">Timed tests use one minute per question. Questions are practice material and are not guaranteed to appear in any company assessment.</p></div><aside className="space-y-4"><div className="glass-card p-5"><h2 className="font-semibold text-slate-900 dark:text-white">{company?.name || 'Your'} progress</h2><div className="mt-4 grid grid-cols-2 gap-4"><div><p className="text-xs text-slate-500">Tests completed</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{progress?.testsCompleted || 0}</p></div><div><p className="text-xs text-slate-500">Average score</p><p className="mt-1 text-2xl font-bold text-primary-600">{progress?.averageScore || 0}%</p></div><div><p className="text-xs text-slate-500">Questions solved</p><p className="mt-1 text-2xl font-bold text-emerald-600">{progress?.questionsSolved || 0}</p></div><div><p className="text-xs text-slate-500">Best score</p><p className="mt-1 text-2xl font-bold text-amber-600">{progress?.bestScore || 0}%</p></div></div></div><div className="glass-card p-5"><h2 className="font-semibold text-slate-900 dark:text-white">Practice categories</h2><div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300"><p className="flex justify-between"><span>Quantitative Aptitude</span><span className="text-slate-400">Percentages · Profit & Loss</span></p><p className="flex justify-between"><span>Logical Reasoning</span><span className="text-slate-400">Series · Coding</span></p><p className="flex justify-between"><span>Verbal Ability</span><span className="text-slate-400">Grammar · Vocabulary</span></p></div></div></aside></div></div>
}
