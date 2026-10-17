import { Button, ButtonLink } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { formatPrice } from '@/shared/format'

export function CartSummary({ cart }) {
  const blocked = cart.items.some((i) => i.quantity > i.product.stock || !i.product.is_active)
  return (
    <Card as="aside" className="h-fit space-y-5 p-6">
      <h2 className="text-lg font-bold">Order summary</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Items</dt>
          <dd className="font-semibold">{cart.item_count}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Delivery</dt>
          <dd className="font-semibold">Pay on delivery</dd>
        </div>
        <div className="flex justify-between rounded-2xl bg-navy-50 px-4 py-3 text-base">
          <dt className="font-bold">Total</dt>
          <dd className="font-extrabold">{formatPrice(cart.total)}</dd>
        </div>
      </dl>
      {blocked ? (
        <Button className="w-full" disabled>Checkout</Button>
      ) : (
        <ButtonLink to="/checkout" className="w-full">Checkout</ButtonLink>
      )}
    </Card>
  )
}
