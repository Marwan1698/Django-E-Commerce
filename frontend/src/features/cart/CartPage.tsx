import { Link } from 'react-router'

import { ProductImage } from '@/components/ProductImage'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageSpinner } from '@/components/ui/Spinner'
import { describeError } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import type { CartItem } from '@/lib/types'

import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from './api'

function CartLine({ item }: { item: CartItem }) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const error = update.error ?? remove.error
  const busy = update.isPending || remove.isPending
  const { product } = item

  return (
    <li className="flex gap-4 py-5">
      <Link to={`/products/${product.id}`} className="shrink-0">
        <ProductImage product={product} className="size-20 rounded-lg ring-1 ring-slate-200" />
      </Link>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex justify-between gap-4">
          <div>
            <Link to={`/products/${product.id}`} className="font-medium hover:text-brand-700">{product.name}</Link>
            <p className="text-sm text-slate-500">{formatPrice(product.price)} each</p>
          </div>
          <p className="font-semibold">{formatPrice(item.line_total)}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor={`qty-${item.id}`}>Quantity for {product.name}</label>
          <select
            id={`qty-${item.id}`}
            value={item.quantity}
            disabled={busy}
            onChange={(e) => update.mutate({ itemId: item.id, quantity: Number(e.target.value) })}
            className="rounded-lg border-0 py-1.5 pr-8 pl-3 text-sm ring-1 ring-slate-300 ring-inset"
          >
            {Array.from({ length: Math.max(product.stock, item.quantity) }, (_, i) => i + 1).slice(0, 20).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => remove.mutate(item.id)}>
            Remove
          </Button>
        </div>
        {item.quantity > product.stock && (
          <p className="text-sm text-amber-700">Only {product.stock} left — reduce the quantity to check out.</p>
        )}
        {error && <p className="text-sm text-red-600">{describeError(error)}</p>}
      </div>
    </li>
  )
}

export function CartPage() {
  const { data: cart, isPending, error } = useCart()
  const clear = useClearCart()

  if (isPending) return <PageSpinner />
  if (error) return <Alert>{describeError(error)}</Alert>

  if (cart.items.length === 0) {
    return (
      <EmptyState title="Your cart is empty">
        <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">Continue shopping</Link>
      </EmptyState>
    )
  }

  const blocked = cart.items.some((i) => i.quantity > i.product.stock || !i.product.is_active)

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Cart</h1>
          <Button variant="ghost" size="sm" loading={clear.isPending} onClick={() => clear.mutate()}>
            Empty cart
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-slate-200 rounded-2xl bg-white px-5 ring-1 ring-slate-200">
          {cart.items.map((item) => (
            <CartLine key={item.id} item={item} />
          ))}
        </ul>
      </section>
      <aside className="h-fit space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="font-semibold">Order summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Items</dt>
            <dd>{cart.item_count}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(cart.total)}</dd>
          </div>
        </dl>
        {blocked ? (
          <Button className="w-full" disabled>Checkout</Button>
        ) : (
          <Link
            to="/checkout"
            className="flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Checkout
          </Link>
        )}
      </aside>
    </div>
  )
}
