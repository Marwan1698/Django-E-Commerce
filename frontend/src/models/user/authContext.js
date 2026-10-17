import { createContext, useContext } from 'react'

/**
 * { user, initializing, login(login, password), register(input), logout(), setUser(user) }
 * `initializing` is true until the first silent refresh has finished.
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
