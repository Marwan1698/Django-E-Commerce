import { useLocation, useParams } from 'react-router'

import { ApiError, describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { BackLink } from '@/shared/components/BackLink'
import { Button } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'
import { formatDate } from '@/shared/format'

import { useCancelOrder, useOrder } from '../api'
import { OrderItemsTable } from '../components/OrderItemsTable'
import { StatusBadge } from '../components/StatusBadge'

export function OrderDetailScene() {
  const { id } = useParams()
  const location = useLocation()
  const { data: order, isPending, error } = useOrder(id)
  const cancel = useCancelOrder()

  if (isPending) return <PageSpinner />
  if (error) {
    return <Alert>{error instanceof ApiError && error.status === 404 ? 'Order not found.' : describeError(error)}</Alert>
  }

  return (
    <div className="space-y-6">
      <BackLink to="/orders">All orders</BackLink>
      {location.state?.placed && order.status === 'pending' && (
        <Alert tone="success">Thanks! Your order has been placed. You’ll pay on delivery.</Alert>
      )}
      <PageHeader title={`Order #${order.id}`} subtitle={`Placed ${formatDate(order.created_at)}`} action={<StatusBadge status={order.status} />} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card as="section" className="overflow-hidden lg:col-span-2">
          <OrderItemsTable order={order} />
        </Card>
        <Card as="aside" className="h-fit space-y-5 p-6 text-sm">
          <div>
            <h2 className="text-base font-bold">Delivery</h2>
            <p className="mt-2 font-semibold">{order.full_name}</p>
            <p className="text-slate-600">{order.phone_number}</p>
            <p className="whitespace-pre-line text-slate-600">{order.shipping_address}</p>
          </div>
          <div>
            <h2 className="text-base font-bold">Payment</h2>
            <p className="mt-2 text-slate-600">Cash on delivery</p>
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
        </Card>
      </div>
    </div>
  )
}
