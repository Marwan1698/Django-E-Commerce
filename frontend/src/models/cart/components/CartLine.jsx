import { Link } from 'react-router'

import { ProductImage } from '@/models/product/components/ProductImage'
import { describeError } from '@/shared/api'
import { Button } from '@/shared/components/Button'
import { formatPrice } from '@/shared/format'

import { useRemoveCartItem, useUpdateCartItem } from '../api'

export function CartLine({ item }) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const error = update.error ?? remove.error
  const busy = update.isPending || remove.isPending
  const { product } = item
  const options = Array.from({ length: Math.min(20, Math.max(product.stock, item.quantity)) }, (_, i) => i + 1)

  return (
    <li className="flex gap-4 rounded-2xl p-3">
      <Link to={`/products/${product.id}`} className="shrink-0">
        <ProductImage product={product} className="size-20 rounded-2xl" />
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <Link to={`/products/${product.id}`} className="font-bold hover:text-navy-600">{product.name}</Link>
            <p className="text-sm text-slate-500">{formatPrice(product.price)} each</p>
          </div>
          <p className="font-extrabold">{formatPrice(item.line_total)}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`qty-${item.id}`}>Quantity for {product.name}</label>
          <select
            id={`qty-${item.id}`}
            value={item.quantity}
            disabled={busy}
            onChange={(e) => update.mutate({ itemId: item.id, quantity: Number(e.target.value) })}
            className="rounded-full border-0 bg-slate-100 py-1.5 pr-8 pl-4 text-sm font-semibold focus:ring-2 focus:ring-navy-600"
          >
            {options.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => remove.mutate(item.id)}>
            Remove
          </Button>
        </div>
        {item.quantity > product.stock && (
          <p className="text-sm font-medium text-red-700">Only {product.stock} left. Reduce the quantity to check out.</p>
        )}
        {error && <p className="text-sm text-red-700">{describeError(error)}</p>}
      </div>
    </li>
  )
}
