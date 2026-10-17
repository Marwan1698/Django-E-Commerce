import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/auth/AuthContext'
import { api, setAccessToken } from '@/lib/api'
import type { AuthResponse, User } from '@/lib/types'

export type ProfileInput = Pick<User, 'first_name' | 'last_name' | 'email' | 'phone_number' | 'address'>

export function useUpdateProfile() {
  const { setUser } = useAuth()
  return useMutation({
    mutationFn: (input: ProfileInput) => api<User>('/api/auth/me/', { method: 'PATCH', body: input }),
    onSuccess: setUser,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { current_password: string; new_password: string }) =>
      api<AuthResponse>('/api/auth/change-password/', { method: 'POST', body: input }),
    // Other devices were signed out; this one receives a fresh token pair.
    onSuccess: (res) => setAccessToken(res.access),
  })
}
