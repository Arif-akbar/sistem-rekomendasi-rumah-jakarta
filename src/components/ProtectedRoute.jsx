import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/UseAuth'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0a14' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(124,58,237,0.3)', borderTopColor: '#a78bfa' }}
        />
        <p className="text-sm font-medium" style={{ color: 'rgba(167,139,250,0.6)' }}>
          Memuat...
        </p>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default ProtectedRoute
