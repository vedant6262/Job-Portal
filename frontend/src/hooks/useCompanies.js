import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api'
import toast from 'react-hot-toast'

export function useCompanies(params = {}) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => api.get('/companies', { params }).then(res => res.data),
  })
}

export function useCompany(id) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => api.get(`/companies/${id}`).then(res => res.data),
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/companies', data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company profile created')
    },
    onError: (error) => toast.error(error.message),
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/companies/${id}`, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
