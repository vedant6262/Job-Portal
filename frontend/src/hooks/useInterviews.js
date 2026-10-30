import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

export function useInterviews() {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.get('/interviews').then(res => res.data),
  })
}

export function useCreateInterview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/interviews', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Interview scheduled')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateInterviewStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/interviews/${id}/status`, { status }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Interview status updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
