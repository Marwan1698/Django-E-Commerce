import { Link, useSearchParams } from 'react-router'

import { StatusBadge } from '@/components/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import { PAGE_SIZE } from '@/features/catalog/api'
import { describeError } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/format'

import { useOrders } from './api'

export function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, error } = useOrders(page)

  if (isPending) return <PageSpinner />
  if (error) return <Alert>{describeError(error)}</Alert>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Your orders</h1>
      {data.results.length === 0 ? (
        <EmptyState title="No orders yet">
          <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">Start shopping</Link>
        </EmptyState>
      ) : (
        <>
          <ul className="divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
            {data.results.map((order) => (
              <li key={order.id}>
                <Link to={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-slate-500">
                      {formatDate(order.created_at)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={order.status} />
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onChange={(p) => setParams({ page: String(p) })} />
        </>
      )}
    </div>
  )
}
