import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { api, refreshAccessToken, setAccessToken, setSessionExpiredHandler } from '@/shared/api'

import { AuthContext } from '../authContext'

const PUBLIC_QUERIES = new Set(['products', 'categories'])

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  const signOutLocally = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    queryClient.removeQueries({ predicate: (q) => !PUBLIC_QUERIES.has(q.queryKey[0]) })
  }, [queryClient])

  // Restore the session from the refresh cookie on first load.
  useEffect(() => {
    let cancelled = false
    refreshAccessToken()
      .then((token) => (token ? api('/api/auth/me/') : null))
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

  const value = useMemo(() => {
    const start = (res) => {
      setAccessToken(res.access)
      setUser(res.user)
      return res.user
    }
    return {
      user,
      initializing,
      setUser,
      login: (login, password) => api('/api/auth/login/', { method: 'POST', body: { login, password } }).then(start),
      register: (input) => api('/api/auth/register/', { method: 'POST', body: input }).then(start),
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
