import { Link, useSearchParams } from 'react-router'

import { PAGE_SIZE } from '@/models/product/api'
import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { ButtonLink } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { PageSpinner } from '@/shared/components/Spinner'
import { formatDate, formatPrice } from '@/shared/format'

import { useOrders } from '../api'
import { StatusBadge } from '../components/StatusBadge'

export function OrdersScene() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, error } = useOrders(page)

  if (isPending) return <PageSpinner />
  if (error) return <Alert>{describeError(error)}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader title="Your orders" />
      {data.results.length === 0 ? (
        <EmptyState title="No orders yet">
          <ButtonLink to="/" className="mt-4">Start shopping</ButtonLink>
        </EmptyState>
      ) : (
        <>
          <Card as="ul" className="divide-y divide-slate-100 p-2">
            {data.results.map((order) => (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-4 hover:bg-slate-50">
                  <div>
                    <p className="font-bold">Order #{order.id}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(order.created_at)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="font-extrabold">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </Card>
          <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onChange={(p) => setParams({ page: String(p) })} />
        </>
      )}
    </div>
  )
}
