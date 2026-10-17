import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'

import { useAuth } from '@/auth/AuthContext'
import { ProductImage } from '@/components/ProductImage'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAddToCart } from '@/features/cart/api'
import { ApiError, describeError } from '@/lib/api'
import { formatPrice } from '@/lib/format'

import { useProduct } from './api'

export function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: product, isPending, error } = useProduct(id)
  const addToCart = useAddToCart()
  const [quantity, setQuantity] = useState(1)

  if (isPending) return <PageSpinner />
  if (error) {
    return (
      <Alert>
        {error instanceof ApiError && error.status === 404 ? 'This product does not exist.' : describeError(error)}
      </Alert>
    )
  }

  const isOwner = user?.username === product.seller

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">← Back to shop</Link>
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage product={product} className="aspect-square w-full rounded-2xl ring-1 ring-slate-200" />
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">{product.category.name}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Sold by {product.seller}</p>
          </div>
          <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
          {product.description && <p className="whitespace-pre-line text-slate-700">{product.description}</p>}
          <p className={`text-sm font-medium ${product.in_stock ? 'text-emerald-700' : 'text-red-600'}`}>
            {product.in_stock ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {addToCart.isSuccess && (
            <Alert tone="success">
              Added to your cart. <Link to="/cart" className="font-semibold underline">View cart</Link>
            </Alert>
          )}
          {addToCart.isError && <Alert>{describeError(addToCart.error)}</Alert>}

          {isOwner ? (
            <div className="flex gap-3">
              <Link to={`/selling/${product.id}/edit`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                Edit listing
              </Link>
            </div>
          ) : (
            product.in_stock && (
              <div className="flex items-end gap-3">
                <div>
                  <label htmlFor="qty" className="block text-sm font-medium text-slate-700">Quantity</label>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value) || 1)))}
                    className="mt-1.5 w-20 rounded-lg border-0 px-3 py-2 text-sm ring-1 ring-slate-300 ring-inset"
                  />
                </div>
                <Button
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
            )
          )}
        </div>
      </div>
    </div>
  )
}
