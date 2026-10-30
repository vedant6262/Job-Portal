import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlinePaperAirplane, HiOutlineSparkles } from 'react-icons/hi2'

const suggestions = [
  'Find me a React developer job',
  'Suggest remote jobs for me',
  'Improve my resume',
  'Prepare me for an interview',
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI career assistant. How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return
    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const assistantMessage = { role: 'assistant', content: getMockResponse(text) }
    setTimeout(() => {
      setMessages(prev => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  const getMockResponse = (query) => {
    const q = query.toLowerCase()
    if (q.includes('react') || q.includes('frontend')) {
      return 'I found 15+ React developer positions matching your profile. Top matches include Senior React Developer at Google (Remote, $150k-$200k) and React Native Engineer at Stripe (Hybrid, $130k-$180k). Would you like to see more details?'
    }
    if (q.includes('remote')) {
      return 'Great choice! I found 230+ remote positions across various roles. Trending remote jobs include: \n1. Staff Software Engineer - GitLab ($180k-$250k)\n2. Product Designer - Zapier ($120k-$160k)\n3. Developer Advocate - Cloudflare ($130k-$170k)\n\nWould you like me to refine by your preferred tech stack?'
    }
    if (q.includes('resume') || q.includes('improve')) {
      return 'I can help optimize your resume! Key suggestions:\n1. Add quantifiable achievements (e.g., "Improved performance by 40%")\n2. Use keywords from job descriptions\n3. Keep it to one page for <10 years experience\n4. Include your GitHub/portfolio link prominently\n\nWould you like me to generate an ATS-optimized summary for your profile?'
    }
    if (q.includes('interview') || q.includes('prepare')) {
      return 'I\'ll help you prepare! Common interview topics:\n\n**Technical:**\n- System Design (scalability, microservices)\n- Data Structures & Algorithms\n- System architecture decisions\n\n**Behavioral:**\n- "Tell me about a challenging project"\n- "How do you handle conflicts?"\n\nWould you like me to generate specific questions based on a job description?'
    }
    return 'I can help you with:\n- Finding jobs matching your skills\n- Resume optimization & ATS scoring\n- Interview preparation\n- Career advice & salary insights\n\nWhat would you like help with?'
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <HiOutlineChatBubbleLeftRight className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] glass-card flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-500 to-primary-600">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <HiOutlineSparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Career Assistant</h3>
                    <p className="text-xs text-white/70">Online</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all">
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-md'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/10 dark:hover:text-primary-400 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="input-field flex-1 py-2.5"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || loading}
                    className="btn-primary p-2.5 rounded-xl"
                  >
                    <HiOutlinePaperAirplane className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
