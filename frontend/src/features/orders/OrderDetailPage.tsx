import { Link, useLocation, useParams } from 'react-router'

import { StatusBadge } from '@/components/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { ApiError, describeError } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/format'

import { useCancelOrder, useOrder } from './api'

export function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { data: order, isPending, error } = useOrder(id)
  const cancel = useCancelOrder()

  if (isPending) return <PageSpinner />
  if (error) {
    return <Alert>{error instanceof ApiError && error.status === 404 ? 'Order not found.' : describeError(error)}</Alert>
  }

  const justPlaced = (location.state as { placed?: boolean } | null)?.placed

  return (
    <div className="space-y-6">
      <Link to="/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">← All orders</Link>
      {justPlaced && order.status === 'pending' && (
        <Alert tone="success">Thanks! Your order has been placed. You’ll pay on delivery.</Alert>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order #{order.id}</h1>
          <p className="text-sm text-slate-500">Placed {formatDate(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl bg-white ring-1 ring-slate-200 lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Qty</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border-t border-slate-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    {item.product ? (
                      <Link to={`/products/${item.product}`} className="hover:text-brand-700">{item.product_name}</Link>
                    ) : (
                      item.product_name
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">{formatPrice(item.unit_price)}</td>
                  <td className="px-5 py-3 text-right">{item.quantity}</td>
                  <td className="px-5 py-3 text-right">{formatPrice(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 font-semibold">
              <tr>
                <td className="px-5 py-3" colSpan={3}>Total</td>
                <td className="px-5 py-3 text-right">{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </section>
        <aside className="h-fit space-y-4 rounded-2xl bg-white p-6 text-sm ring-1 ring-slate-200">
          <div>
            <h2 className="font-semibold">Delivery</h2>
            <p className="mt-1 text-slate-700">{order.full_name}</p>
            <p className="text-slate-700">{order.phone_number}</p>
            <p className="whitespace-pre-line text-slate-700">{order.shipping_address}</p>
          </div>
          <div>
            <h2 className="font-semibold">Payment</h2>
            <p className="mt-1 text-slate-700">Cash on delivery</p>
          </div>
          {cancel.isError && <Alert>{describeError(cancel.error)}</Alert>}
          {order.can_cancel && (
            <Button
              variant="danger"
              className="w-full"
              loading={cancel.isPending}
              onClick={() => {
                if (window.confirm('Cancel this order?')) cancel.mutate(order.id)
              }}
            >
              Cancel order
            </Button>
          )}
        </aside>
      </div>
    </div>
  )
}
