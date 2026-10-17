import { useMutation } from '@tanstack/react-query'

import { api, setAccessToken } from '@/shared/api'

import { useAuth } from './authContext'

export function useUpdateProfile() {
  const { setUser } = useAuth()
  return useMutation({
    mutationFn: (input) => api('/api/auth/me/', { method: 'PATCH', body: input }),
    onSuccess: setUser,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input) => api('/api/auth/change-password/', { method: 'POST', body: input }),
    // Other devices were signed out; this one receives a fresh token pair.
    onSuccess: (res) => setAccessToken(res.access),
  })
}
