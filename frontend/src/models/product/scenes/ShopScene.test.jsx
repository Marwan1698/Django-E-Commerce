import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { expect, it, vi } from 'vitest'

import { AuthContext } from '@/models/user/authContext'
import { api } from '@/shared/api'

import { ShopScene } from './ShopScene'

vi.mock('@/shared/api', async (importOriginal) => ({ ...(await importOriginal()), api: vi.fn() }))

const categories = [
  { id: 1, name: 'Books', slug: 'books' },
  { id: 2, name: 'Clothing', slug: 'clothing' },
]
const hoodie = {
  id: 7,
  name: 'Classic Hoodie',
  price: '39.90',
  image: null,
  in_stock: true,
  category: categories[1],
}

api.mockImplementation(async (path) =>
  path === '/api/categories/' ? categories : { count: 1, results: [hoodie] },
)

function setup(url) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <ShopScene /> },
      { path: '/categories/:slug', element: <ShopScene /> },
    ],
    { initialEntries: [url] },
  )
  const auth = { user: null, initializing: false, login: vi.fn(), register: vi.fn(), logout: vi.fn(), setUser: vi.fn() }
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider value={auth}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return router
}

it('category links keep the other filters but reset the page', async () => {
  setup('/?in_stock=true&ordering=-price&page=2')
  const nav = await screen.findByRole('navigation', { name: 'Categories' })
  expect(within(nav).getByRole('link', { name: 'Books' })).toHaveAttribute(
    'href',
    '/categories/books?in_stock=true&ordering=-price',
  )
  expect(within(nav).getByRole('link', { name: 'All' })).toHaveAttribute('href', '/?in_stock=true&ordering=-price')
})

it('keeps the hero and scroll position when switching category', async () => {
  const router = setup('/')
  await userEvent.click(await screen.findByRole('link', { name: 'Books' }))
  expect(router.state.location.pathname).toBe('/categories/books')
  expect(router.state.preventScrollReset).toBe(true)
  expect(screen.getByRole('heading', { name: 'Buy and sell, all in one place.' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Books' })).toBeInTheDocument()
})

it('filters without jumping back to the top of the page', async () => {
  const router = setup('/')
  await screen.findByText('Classic Hoodie')

  await userEvent.click(screen.getByRole('checkbox', { name: 'In stock only' }))
  expect(router.state.location.search).toBe('?in_stock=true')
  expect(router.state.preventScrollReset).toBe(true)

  await userEvent.click(screen.getByRole('button', { name: 'Sort: Newest' }))
  await userEvent.click(await screen.findByRole('option', { name: 'Price: high to low' }))
  expect(screen.getByRole('button', { name: 'Sort: Price: high to low' })).toBeInTheDocument()
  expect(router.state.location.search).toBe('?in_stock=true&ordering=-price')
  expect(router.state.preventScrollReset).toBe(true)
})

it('keeps focus in the search box after searching', async () => {
  const router = setup('/')
  const box = await screen.findByRole('searchbox', { name: 'Search products' })
  await userEvent.type(box, 'hoodie{Enter}')
  expect(router.state.location.search).toBe('?search=hoodie')
  expect(box).toHaveFocus()
  expect(box).toHaveValue('hoodie')
})

it('shows not found for an unknown category', async () => {
  setup('/categories/nope')
  expect(await screen.findByText('Page not found')).toBeInTheDocument()
})
