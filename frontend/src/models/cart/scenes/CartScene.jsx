import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { Button, ButtonLink } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'

import { useCart, useClearCart } from '../api'
import { CartLine } from '../components/CartLine'
import { CartSummary } from '../components/CartSummary'

export function CartScene() {
  const { data: cart, isPending, error } = useCart()
  const clear = useClearCart()

  if (isPending) return <PageSpinner />
  if (error) return <Alert>{describeError(error)}</Alert>

  if (cart.items.length === 0) {
    return (
      <EmptyState title="Your cart is empty">
        <ButtonLink to="/" className="mt-4">Continue shopping</ButtonLink>
      </EmptyState>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cart"
        action={
          <Button variant="ghost" size="sm" loading={clear.isPending} onClick={() => clear.mutate()}>
            Empty cart
          </Button>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card as="ul" className="divide-y divide-slate-100 p-2 lg:col-span-2">
          {cart.items.map((item) => (
            <CartLine key={item.id} item={item} />
          ))}
        </Card>
        <CartSummary cart={cart} />
      </div>
    </div>
  )
}
