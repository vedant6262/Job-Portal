import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

const isLocalDev = import.meta.env.DEV || ['localhost', '127.0.0.1'].includes(window.location.hostname)

api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else if (isLocalDev) {
      config.headers['X-Dev-User-Id'] = 'mock-user-1'
      delete config.headers.Authorization
    }
  } catch (error) {
    console.error('Error getting auth token:', error)
    if (isLocalDev) {
      config.headers['X-Dev-User-Id'] = 'mock-user-1'
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
