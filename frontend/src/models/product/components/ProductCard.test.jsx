import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'

import { ProductCard } from './ProductCard'

const product = {
  id: 7,
  name: 'Classic Hoodie',
  price: '39.90',
  image: null,
  in_stock: true,
  category: { id: 1, name: 'Clothing', slug: 'clothing' },
}

it('links to the product and shows price and category', () => {
  render(<ProductCard product={product} />, { wrapper: MemoryRouter })
  expect(screen.getByRole('link')).toHaveAttribute('href', '/products/7')
  expect(screen.getByText('$39.90')).toBeInTheDocument()
  expect(screen.getByText('Clothing')).toBeInTheDocument()
  expect(screen.queryByText('Sold out')).not.toBeInTheDocument()
})

it('marks sold-out products', () => {
  render(<ProductCard product={{ ...product, in_stock: false }} />, { wrapper: MemoryRouter })
  expect(screen.getByText('Sold out')).toBeInTheDocument()
})
