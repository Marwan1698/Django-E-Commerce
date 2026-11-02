import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { useAuth } from '@/models/user/authContext'
import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { Button } from '@/shared/components/Button'
import { QuantityStepper } from '@/shared/components/QuantityStepper'

import { useAddToCart } from '../api'

export function AddToCartForm({ product }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const addToCart = useAddToCart()
  const [quantity, setQuantity] = useState(1)

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
        <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock} />
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
