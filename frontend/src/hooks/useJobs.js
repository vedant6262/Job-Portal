import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

export function useJobs(params = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => api.get('/jobs', { params }).then(res => res.data),
    placeholderData: (prev) => prev,
  })
}

export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then(res => res.data),
    enabled: !!id,
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/jobs', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job posted successfully')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/jobs/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job updated successfully')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/jobs/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job deleted')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useExternalJobs(params = {}) {
  return useQuery({
    queryKey: ['externalJobs', params],
    queryFn: () => api.get('/jobs/external', { params }).then(res => res.data),
    placeholderData: (prev) => prev,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  })
}


