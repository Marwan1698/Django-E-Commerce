import { createContext, useContext } from 'react'

import type { User } from '@/lib/types'

export interface RegisterInput {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface AuthContextValue {
  user: User | null
  /** True until the initial silent refresh has finished. */
  initializing: boolean
  login: (login: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
