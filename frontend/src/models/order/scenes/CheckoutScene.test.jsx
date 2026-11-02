import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, expect, it, vi } from 'vitest'

import { CheckoutScene } from './CheckoutScene'

const cartState = vi.hoisted(() => ({ current: null }))
const orderState = vi.hoisted(() => ({ current: null }))

vi.mock('@/models/cart/api', () => ({ useCart: () => cartState.current }))
vi.mock('../api', () => ({ usePlaceOrder: () => orderState.current }))
vi.mock('../components/CheckoutForm', () => ({ CheckoutForm: () => <p>Checkout form</p> }))

const emptyCart = { data: { items: [], total: '0.00' }, isPending: false }

function renderAt() {
  const router = createMemoryRouter(
    [
      { path: '/checkout', element: <CheckoutScene /> },
      { path: '/cart', element: <p>Cart page</p> },
    ],
    { initialEntries: ['/checkout'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

beforeEach(() => {
  orderState.current = { isSuccess: false }
})

it('sends you back to the cart when there is nothing to check out', async () => {
  cartState.current = emptyCart
  renderAt()
  expect(await screen.findByText('Cart page')).toBeInTheDocument()
})

it('does not bounce to the cart right after an order empties it', () => {
  cartState.current = emptyCart
  orderState.current = { isSuccess: true }
  const router = renderAt()
  expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  expect(router.state.location.pathname).toBe('/checkout')
})

it('shows the form when the cart has items', () => {
  cartState.current = {
    data: { items: [{ id: 1, quantity: 1, line_total: '5.00', product: { name: 'Mug' } }], total: '5.00' },
    isPending: false,
  }
  renderAt()
  expect(screen.getByText('Checkout form')).toBeInTheDocument()
})
