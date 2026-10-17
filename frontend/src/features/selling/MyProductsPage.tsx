import { Link, useSearchParams } from 'react-router'

import { ProductImage } from '@/components/ProductImage'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import { PAGE_SIZE } from '@/features/catalog/api'
import { describeError } from '@/lib/api'
import { formatPrice } from '@/lib/format'

import { useDeleteProduct, useMyProducts } from './api'

export function MyProductsPage() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, error } = useMyProducts(page)
  const remove = useDeleteProduct()

  const newButton = (
    <Link to="/selling/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
      List a product
    </Link>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your listings</h1>
          <p className="text-slate-600">Products you’re selling.</p>
        </div>
        {newButton}
      </div>
      {remove.isError && <Alert>{describeError(remove.error)}</Alert>}
      {isPending ? (
        <PageSpinner />
      ) : error ? (
        <Alert>{describeError(error)}</Alert>
      ) : data.results.length === 0 ? (
        <EmptyState title="You haven’t listed anything yet">Your products will show up here.</EmptyState>
      ) : (
        <>
          <ul className="divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
            {data.results.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <ProductImage product={product} className="size-14 rounded-lg ring-1 ring-slate-200" />
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${product.id}`} className="font-medium hover:text-brand-700">{product.name}</Link>
                  <p className="text-sm text-slate-500">
                    {formatPrice(product.price)} · {product.stock} in stock · {product.category.name}
                    {!product.is_active && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">Hidden</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/selling/${product.id}/edit`}
                    className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={remove.isPending && remove.variables === product.id}
                    onClick={() => {
                      if (window.confirm(`Delete “${product.name}”? This can’t be undone.`)) remove.mutate(product.id)
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onChange={(p) => setParams({ page: String(p) })} />
        </>
      )}
    </div>
  )
}
