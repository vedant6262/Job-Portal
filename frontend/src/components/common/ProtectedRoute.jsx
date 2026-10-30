import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const auth = useAuth()
  const location = useLocation()

  const isLoaded = auth.isLoaded ?? true
  if (!isLoaded) return <LoadingScreen />
  if (!auth.isSignedIn) return <Navigate to={redirectTo} state={{ from: location }} replace />
  return children
}
