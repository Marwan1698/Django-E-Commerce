import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { AuthContext, type AuthContextValue } from '@/auth/AuthContext'
import { ApiError } from '@/lib/api'

import { LoginPage } from './LoginPage'

const login = vi.fn<AuthContextValue['login']>()

function setup(state?: { from: string }) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { path: '*', element: <p>Landed on page</p> },
    ],
    { initialEntries: [{ pathname: '/login', state }] },
  )
  const auth: AuthContextValue = {
    user: null,
    initializing: false,
    login,
    register: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
  }
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider value={auth}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return router
}

beforeEach(() => login.mockReset())
afterEach(() => vi.restoreAllMocks())

it('validates before calling the API', async () => {
  setup()
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByText('Enter your username or email.')).toBeInTheDocument()
  expect(screen.getByText('Enter your password.')).toBeInTheDocument()
  expect(login).not.toHaveBeenCalled()
})

it('shows the server error on bad credentials', async () => {
  login.mockRejectedValueOnce(new ApiError(400, { non_field_errors: ['Invalid credentials.'] }))
  setup()
  await userEvent.type(screen.getByLabelText('Username or email'), 'alice')
  await userEvent.type(screen.getByLabelText('Password'), 'wrong')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials.')
})

it('returns to the page that required login', async () => {
  login.mockResolvedValueOnce({} as never)
  const router = setup({ from: '/checkout' })
  await userEvent.type(screen.getByLabelText('Username or email'), 'alice')
  await userEvent.type(screen.getByLabelText('Password'), 'S3cure-pass!')
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }))
  expect(await screen.findByText('Landed on page')).toBeInTheDocument()
  expect(login).toHaveBeenCalledWith('alice', 'S3cure-pass!')
  expect(router.state.location.pathname).toBe('/checkout')
})
