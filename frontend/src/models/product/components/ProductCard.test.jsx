import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'

import { AuthContext } from '@/models/user/authContext'
import { api } from '@/shared/api'

import { ProductCard } from './ProductCard'

vi.mock('@/shared/api', async (importOriginal) => ({ ...(await importOriginal()), api: vi.fn() }))

const product = {
  id: 7,
  name: 'Classic Hoodie',
  price: '39.90',
  image: null,
  stock: 5,
  in_stock: true,
  seller: 'sam',
  category: { id: 1, name: 'Clothing', slug: 'clothing' },
}
const cartWith = (quantity) => ({
  item_count: quantity,
  items: quantity ? [{ id: 70, product, quantity, line_total: '0' }] : [],
})

function setup({ user = null, cart = cartWith(0), props = {} } = {}) {
  let current = cart
  api.mockImplementation(async (path, options = {}) => {
    if (path === '/api/cart/items/' && options.method === 'POST') current = cartWith(options.body.quantity)
    else if (path === '/api/cart/items/70/' && options.method === 'PATCH') current = cartWith(options.body.quantity)
    else if (path === '/api/cart/items/70/' && options.method === 'DELETE') current = cartWith(0)
    return current
  })
  const router = createMemoryRouter(
    [
      { path: '/', element: <ProductCard product={{ ...product, ...props }} /> },
      { path: '*', element: <p>Elsewhere</p> },
    ],
    { initialEntries: ['/?ordering=price'] },
  )
  const auth = { user, initializing: false, login: vi.fn(), register: vi.fn(), logout: vi.fn(), setUser: vi.fn() }
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider value={auth}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
  return router
}

beforeEach(() => api.mockReset())

it('links to the product and shows price and category', () => {
  setup()
  expect(screen.getByRole('link', { name: 'Classic Hoodie' })).toHaveAttribute('href', '/products/7')
  expect(screen.getByText('$39.90')).toBeInTheDocument()
  expect(screen.getByText('Clothing')).toBeInTheDocument()
  expect(screen.queryByText('Sold out')).not.toBeInTheDocument()
})

it('marks sold-out products and offers no add button', () => {
  setup({ user: { username: 'alex' }, props: { in_stock: false, stock: 0 } })
  expect(screen.getByText('Sold out')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Add/ })).not.toBeInTheDocument()
})

it('sends guests to log in, then back to the same list', async () => {
  const router = setup()
  await userEvent.click(screen.getByRole('button', { name: 'Add Classic Hoodie to cart' }))
  expect(router.state.location.pathname).toBe('/login')
  expect(router.state.location.state).toEqual({ from: '/?ordering=price' })
})

it('adds to the cart, then steps the quantity and removes at zero', async () => {
  const router = setup({ user: { username: 'alex' } })
  await userEvent.click(await screen.findByRole('button', { name: 'Add Classic Hoodie to cart' }))
  expect(api).toHaveBeenCalledWith('/api/cart/items/', { method: 'POST', body: { product_id: 7, quantity: 1 } })

  const qty = await screen.findByRole('spinbutton', { name: 'Quantity of Classic Hoodie in your cart' })
  expect(qty).toHaveValue(1)
  await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
  expect(await screen.findByDisplayValue('2')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))
  await userEvent.click(await screen.findByRole('button', { name: 'Decrease quantity' }))
  expect(await screen.findByRole('button', { name: 'Add Classic Hoodie to cart' })).toBeInTheDocument()
  expect(api).toHaveBeenCalledWith('/api/cart/items/70/', { method: 'DELETE' })
  expect(router.state.location.pathname).toBe('/') // never followed the card link
})

it('hides the control on your own listing', () => {
  setup({ user: { username: 'sam' } })
  expect(screen.queryByRole('button', { name: /Add/ })).not.toBeInTheDocument()
})
