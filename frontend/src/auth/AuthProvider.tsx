import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { api, refreshAccessToken, setAccessToken, setSessionExpiredHandler } from '@/lib/api'
import type { AuthResponse, User } from '@/lib/types'

import { AuthContext, type AuthContextValue, type RegisterInput } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  const signOutLocally = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'products' && q.queryKey[0] !== 'categories' })
  }, [queryClient])

  // Restore the session from the refresh cookie on first load.
  useEffect(() => {
    let cancelled = false
    refreshAccessToken()
      .then((token) => (token ? api<User>('/api/auth/me/') : null))
      .then((me) => !cancelled && setUser(me))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setInitializing(false))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(signOutLocally)
    return () => setSessionExpiredHandler(null)
  }, [signOutLocally])

  const value = useMemo<AuthContextValue>(() => {
    const start = (res: AuthResponse) => {
      setAccessToken(res.access)
      setUser(res.user)
      return res.user
    }
    return {
      user,
      initializing,
      setUser,
      login: (login, password) =>
        api<AuthResponse>('/api/auth/login/', { method: 'POST', body: { login, password } }).then(start),
      register: (input: RegisterInput) =>
        api<AuthResponse>('/api/auth/register/', { method: 'POST', body: input }).then(start),
      logout: async () => {
        try {
          await api('/api/auth/logout/', { method: 'POST' })
        } finally {
          signOutLocally()
        }
      },
    }
  }, [user, initializing, signOutLocally])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
