import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { AuthProvider } from '@/models/user/components/AuthProvider'
import { ApiError } from '@/shared/api'

import { routes } from './routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Don't retry client errors like 404/403; do retry network/server errors.
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    },
  },
})

// React Router keys the first history entry of every fresh page load as
// "default", so all fresh visits share one saved scroll position: opening the
// shop would jump to wherever an earlier visit was left. Give the entry its own
// key — a reload still restores its position, a new visit starts at the top.
if (!window.history.state?.key) {
  const state = window.history.state ?? {}
  window.history.replaceState(
    { ...state, usr: state.usr ?? null, key: Math.random().toString(36).slice(2, 10), idx: state.idx ?? 0 },
    '',
  )
}

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
