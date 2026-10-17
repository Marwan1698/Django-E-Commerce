import { Link, useSearchParams } from 'react-router'

import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { Button, ButtonLink } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import { Pagination } from '@/shared/components/Pagination'
import { PageSpinner } from '@/shared/components/Spinner'
import { formatPrice } from '@/shared/format'

import { PAGE_SIZE, useDeleteProduct, useMyProducts } from '../api'
import { ProductImage } from '../components/ProductImage'

export function MyProductsScene() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const { data, isPending, error } = useMyProducts(page)
  const remove = useDeleteProduct()

  return (
    <div className="space-y-6">
      <PageHeader title="Your listings" subtitle="Products you’re selling." action={<ButtonLink to="/selling/new">+ List a product</ButtonLink>} />
      {remove.isError && <Alert>{describeError(remove.error)}</Alert>}
      {isPending ? (
        <PageSpinner />
      ) : error ? (
        <Alert>{describeError(error)}</Alert>
      ) : data.results.length === 0 ? (
        <EmptyState title="You haven’t listed anything yet">Your products will show up here.</EmptyState>
      ) : (
        <>
          <Card as="ul" className="divide-y divide-slate-100 p-2">
            {data.results.map((product) => (
              <li key={product.id} className="flex flex-wrap items-center gap-4 rounded-2xl p-3 hover:bg-slate-50">
                <ProductImage product={product} className="size-16 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${product.id}`} className="font-bold hover:text-navy-600">{product.name}</Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
                    <span className="font-semibold text-navy-800">{formatPrice(product.price)}</span>
                    <span>· {product.stock} in stock</span>
                    <span>· {product.category.name}</span>
                    {!product.is_active && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Hidden</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ButtonLink to={`/selling/${product.id}/edit`} variant="secondary" size="sm">Edit</ButtonLink>
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
          </Card>
          <Pagination page={page} pageSize={PAGE_SIZE} count={data.count} onChange={(p) => setParams({ page: String(p) })} />
        </>
      )}
    </div>
  )
}
