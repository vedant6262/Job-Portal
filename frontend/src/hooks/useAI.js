import { useMutation } from '@tanstack/react-query'
import api from '../utils/api'

export function useATSScore() {
  return useMutation({
    mutationFn: (data) => api.post('/ai/ats-score', data).then(res => res.data),
  })
}

export function useResumeSummary() {
  return useMutation({
    mutationFn: (data) => api.post('/ai/resume-summary', data).then(res => res.data),
  })
}

export function useCoverLetter() {
  return useMutation({
    mutationFn: (data) => api.post('/ai/cover-letter', data).then(res => res.data),
  })
}

export function useInterviewQuestions() {
  return useMutation({
    mutationFn: (data) => api.post('/ai/interview-questions', data).then(res => res.data),
  })
}

export function useJobRecommendations() {
  return useMutation({
    mutationFn: () => api.post('/ai/recommendations').then(res => res.data),
  })
}

export function useAIChat() {
  return useMutation({
    mutationFn: (data) => api.post('/ai/chat', data).then(res => res.data),
  })
}
