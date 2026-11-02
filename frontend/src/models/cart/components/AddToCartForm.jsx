import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { useAuth } from '@/models/user/authContext'
import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'

import { useAddToCart } from '../api'

export function AddToCartForm({ product }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const addToCart = useAddToCart()
  const [quantity, setQuantity] = useState(1)

  const clamp = (n) => Math.min(product.stock, Math.max(1, n))

  return (
    <div className="space-y-4">
      {addToCart.isSuccess && (
        <Alert tone="success">
          Added to your cart.{' '}
          <Link to="/cart" className="font-bold underline underline-offset-4">View cart</Link>
        </Alert>
      )}
      {addToCart.isError && <Alert>{describeError(addToCart.error)}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full bg-slate-100 p-1" role="group" aria-label="Quantity">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-lg font-bold hover:bg-white disabled:opacity-40"
            onClick={() => setQuantity((q) => clamp(q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            aria-label="Quantity"
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(clamp(Number(e.target.value) || 1))}
            className="w-12 [appearance:textfield] border-0 bg-transparent p-0 text-center font-bold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full text-lg font-bold hover:bg-white disabled:opacity-40"
            onClick={() => setQuantity((q) => clamp(q + 1))}
            disabled={quantity >= product.stock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <Button
          size="lg"
          loading={addToCart.isPending}
          onClick={() => {
            if (!user) {
              navigate('/login', { state: { from: location.pathname } })
              return
            }
            addToCart.mutate({ productId: product.id, quantity })
          }}
        >
          Add to cart
        </Button>
      </div>
    </div>
  )
}
