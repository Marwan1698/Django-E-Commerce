import { Link, Navigate } from 'react-router'

import { useCart } from '@/models/cart/api'
import { Card } from '@/shared/components/Card'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'
import { formatPrice } from '@/shared/format'

import { usePlaceOrder } from '../api'
import { CheckoutForm } from '../components/CheckoutForm'

export function CheckoutScene() {
  const { data: cart, isPending } = useCart()
  const placeOrder = usePlaceOrder()

  // After a successful order the cart is empty while we navigate to the
  // order page; don't mistake that for "nothing to check out".
  if (isPending || placeOrder.isSuccess) return <PageSpinner />
  if (!cart || cart.items.length === 0) return <Navigate to="/cart" replace />

  return (
    <div className="space-y-6">
      <PageHeader title="Checkout" subtitle="Where should we deliver your order?" />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="p-6 sm:p-8 lg:col-span-2">
          <CheckoutForm total={cart.total} placeOrder={placeOrder} />
        </Card>
        <Card as="aside" className="h-fit p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Your items</h2>
            <Link to="/cart" className="rounded-full px-3 py-1 text-sm font-semibold text-navy-700 hover:bg-navy-50">Edit</Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-slate-600">{item.quantity} × {item.product.name}</span>
                <span className="font-semibold">{formatPrice(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between rounded-2xl bg-navy-50 px-4 py-3">
            <span className="font-bold">Total</span>
            <span className="font-extrabold">{formatPrice(cart.total)}</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
