import { Navigate, Outlet, useLocation } from 'react-router'

import { PageSpinner } from '@/shared/components/Spinner'

import { useAuth } from '../authContext'

/** Routes inside need a signed-in user; others are sent to /login and back. */
export function RequireAuth() {
  const { user, initializing } = useAuth()
  const location = useLocation()
  if (initializing) return <PageSpinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}

/** Login/register: bounce signed-in users to the shop. */
export function GuestOnly() {
  const { user, initializing } = useAuth()
  if (initializing) return <PageSpinner />
  return user ? <Navigate to="/" replace /> : <Outlet />
}
