import { Navigate, Outlet, useLocation } from 'react-router'

import { PageSpinner } from '@/components/ui/Spinner'

import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <PageSpinner />
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}

/** Login/register pages: bounce signed-in users to the store. */
export function GuestOnly() {
  const { user, initializing } = useAuth()
  if (initializing) return <PageSpinner />
  return user ? <Navigate to="/" replace /> : <Outlet />
}
