import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export function useAuth() {

  const context = useContext(AuthContext)

  // Return safe defaults jika digunakan di luar AuthProvider
  if (!context) {
    return { user: null, profile: null, loading: false, isAdmin: false }
  }

  return context
}