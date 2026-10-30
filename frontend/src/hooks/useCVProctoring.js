import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../utils/api'

const FRAME_INTERVAL_MS = 300
const MAX_FRAME_WIDTH = 640
const MAX_EVENTS = 25
const MAX_EVENT_LOG = 200

function createSessionId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  return `cv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function makeEventId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export default function useCVProctoring({ active, videoRef }) {
  const [status, setStatus] = useState('idle')
  const [analysis, setAnalysis] = useState(null)
  const [events, setEvents] = useState([])
  const [eventLog, setEventLog] = useState([])
  const [eventStats, setEventStats] = useState({ total: 0, counts: {}, firstAt: null, lastAt: null })
  const [startedAt, setStartedAt] = useState(null)
  const [error, setError] = useState('')

  const sessionIdRef = useRef(null)
  const timerRef = useRef(null)
  const runningRef = useRef(false)
  const inFlightRef = useRef(false)
  const canvasRef = useRef(null)

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) return null

    if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
    const canvas = canvasRef.current
    const scale = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth)
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale))

    const context = canvas.getContext('2d')
    if (!context) return null
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.7)
  }, [videoRef])

  useEffect(() => {
    if (!active) {
      runningRef.current = false
      inFlightRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      const sessionId = sessionIdRef.current
      sessionIdRef.current = null
      if (sessionId) api.post('/proctoring/stop', { sessionId }).catch(() => {})
      setStatus('idle')
      setAnalysis(null)
      setEvents([])
      setEventLog([])
      setEventStats({ total: 0, counts: {}, firstAt: null, lastAt: null })
      setStartedAt(null)
      setError('')
      return undefined
    }

    let cancelled = false
    runningRef.current = true
    const sessionId = createSessionId()
    sessionIdRef.current = sessionId
    setStatus('connecting')
    setEventLog([])
    setEventStats({ total: 0, counts: {}, firstAt: null, lastAt: null })
    setStartedAt(new Date().toISOString())
    setError('')

    const analyzeFrame = async () => {
      const video = videoRef.current
      if (inFlightRef.current || !runningRef.current || cancelled || !video || video.readyState < 2 || !video.videoWidth) return

      const image = captureFrame()
      if (!image) return

      inFlightRef.current = true
      try {
        const { data } = await api.post('/proctoring/analyze', { sessionId, image })
        if (cancelled || sessionIdRef.current !== sessionId) return
        setAnalysis(data)
        setStatus('active')
        setError('')

        if (Array.isArray(data.events) && data.events.length > 0) {
          const stamped = data.events.map((event) => ({
            ...event,
            id: makeEventId(),
            receivedAt: new Date().toISOString(),
          }))
          setEvents((previous) => [...stamped, ...previous].slice(0, MAX_EVENTS))
          setEventLog((previous) => [...stamped, ...previous].slice(0, MAX_EVENT_LOG))
          setEventStats((previous) => {
            const counts = { ...previous.counts }
            stamped.forEach((event) => {
              counts[event.type] = (counts[event.type] || 0) + 1
            })
            return {
              total: previous.total + stamped.length,
              counts,
              firstAt: previous.firstAt || stamped[0].receivedAt,
              lastAt: stamped[stamped.length - 1].receivedAt,
            }
          })
        }
      } catch (requestError) {
        if (cancelled || sessionIdRef.current !== sessionId) return
        setStatus('unavailable')
        setError(requestError.message || 'AI proctoring analysis failed.')
      } finally {
        inFlightRef.current = false
      }
    }

    const startSession = async () => {
      for (let attempt = 0; attempt < 12; attempt += 1) {
        if (cancelled || !runningRef.current) return

        try {
          await api.post('/proctoring/session', { sessionId })
          if (cancelled || !runningRef.current) return
          setStatus('active')
          analyzeFrame()
          timerRef.current = setInterval(analyzeFrame, FRAME_INTERVAL_MS)
          return
        } catch (requestError) {
          if (cancelled || !runningRef.current) return
          if (attempt === 11) {
            setStatus('unavailable')
            setError(requestError.message || 'CV proctoring service is unavailable.')
            return
          }
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    startSession()

    return () => {
      cancelled = true
      runningRef.current = false
      inFlightRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (sessionIdRef.current === sessionId) sessionIdRef.current = null
      api.post('/proctoring/stop', { sessionId }).catch(() => {})
    }
  }, [active, captureFrame, videoRef])

  return { status, analysis, events, eventLog, eventStats, startedAt, error }
}
