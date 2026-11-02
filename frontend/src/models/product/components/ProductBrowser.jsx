import { useSearchParams } from 'react-router'

import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { PageSpinner } from '@/shared/components/Spinner'

import { PAGE_SIZE, useProducts } from '../api'
import { ProductCard } from './ProductCard'

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price', label: 'Price: low to high' },
  { value: '-price', label: 'Price: high to low' },
  { value: 'name', label: 'Name' },
]

const control = 'rounded-full border-0 bg-white py-2.5 text-sm font-medium text-navy-900 ring-1 ring-slate-200 ring-inset focus:ring-2 focus:ring-navy-600'

/**
 * Search, sort, stock filter and a paginated product grid. Filters live in
 * the URL so results can be shared and survive reloads.
 */
export function ProductBrowser({ category }) {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const search = params.get('search') ?? ''
  const ordering = params.get('ordering') ?? ''
  const inStock = params.get('in_stock') === 'true'

  const update = (changes) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page') // a new filter starts at page 1
    setParams(next)
  }

  const products = useProducts({
    page,
    category,
    search: search || undefined,
    ordering: ordering || undefined,
    in_stock: inStock || undefined,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          key={search /* reset the box when the URL changes, e.g. back button */}
          role="search"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            update({ search: String(new FormData(e.currentTarget).get('search') ?? '').trim() })
          }}
        >
          <label htmlFor="search" className="sr-only">Search products</label>
          <svg className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Search products…"
            className={`${control} w-full pr-4 pl-10`}
          />
        </form>
        <label htmlFor="ordering" className="sr-only">Sort by</label>
        <select id="ordering" value={ordering} onChange={(e) => update({ ordering: e.target.value })} className={`${control} pr-10 pl-4`}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-navy-900 ring-1 ring-slate-200">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => update({ in_stock: e.target.checked ? 'true' : '' })}
            className="size-4"
          />
          In stock only
        </label>
      </div>

      {products.isPending ? (
        <PageSpinner />
      ) : products.isError ? (
        <Alert>{describeError(products.error)}</Alert>
      ) : products.data.results.length === 0 ? (
        <EmptyState title="No products found">Try a different search or category.</EmptyState>
      ) : (
        <>
          <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${products.isPlaceholderData ? 'opacity-60' : ''}`}>
            {products.data.results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} count={products.data.count} onChange={(p) => update({ page: String(p) })} />
        </>
      )}
    </div>
  )
}
