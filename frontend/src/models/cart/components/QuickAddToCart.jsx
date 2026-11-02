import { useLocation, useNavigate } from 'react-router'

import { useAuth } from '@/models/user/authContext'
import { describeError } from '@/shared/api'
import { QuantityStepper } from '@/shared/components/QuantityStepper'
import { Spinner } from '@/shared/components/Spinner'

import { useAddToCart, useCart, useRemoveCartItem, useUpdateCartItem } from '../api'

/**
 * Add-to-cart control for product cards: "+ Add", then a − n + counter bound
 * to the cart line (going below 1 removes it). Hidden for your own listings
 * and for sold-out products that aren't already in your cart.
 */
export function QuickAddToCart({ product }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const { data: cart } = useCart()
  const add = useAddToCart()
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()

  const item = cart?.items.find((i) => i.product.id === product.id)
  const busy = add.isPending || update.isPending || remove.isPending
  const error = add.error ?? update.error ?? remove.error

  if (user?.username === product.seller) return null
  if (!item && !product.in_stock) return null

  return (
    <div className="flex flex-col items-end gap-1">
      {item ? (
        <div className="animate-pop">
        <QuantityStepper
          size="sm"
          label={`Quantity of ${product.name} in your cart`}
          value={item.quantity}
          min={0}
          max={Math.max(product.stock, item.quantity)}
          disabled={busy}
          onChange={(quantity) =>
            quantity === 0 ? remove.mutate(item.id) : update.mutate({ itemId: item.id, quantity })
          }
        />
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          aria-label={`Add ${product.name} to cart`}
          onClick={() => {
            if (!user) navigate('/login', { state: { from: pathname + search } })
            else add.mutate({ productId: product.id, quantity: 1 })
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-navy-900 px-3.5 text-sm font-semibold text-white transition duration-150 ease-snappy hover:bg-navy-700 active:scale-95 disabled:opacity-60"
        >
          {busy ? <Spinner className="size-3.5" /> : <span aria-hidden="true" className="text-base leading-none">+</span>}
          Add
        </button>
      )}
      {error && (
        <p role="alert" className="max-w-44 animate-fade-in text-right text-xs text-red-700">
          {describeError(error)}
        </p>
      )}
    </div>
  )
}
