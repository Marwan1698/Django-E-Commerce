import { useSearchParams } from 'react-router'

import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { PageSpinner } from '@/components/ui/Spinner'
import { describeError } from '@/lib/api'

import { PAGE_SIZE, useCategories, useProducts } from './api'
import { ProductCard } from './ProductCard'

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price', label: 'Price: low to high' },
  { value: '-price', label: 'Price: high to low' },
  { value: 'name', label: 'Name' },
]

export function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const category = params.get('category') ?? ''
  const search = params.get('search') ?? ''
  const ordering = params.get('ordering') ?? ''
  const inStock = params.get('in_stock') === 'true'

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page') // new filter → back to page 1
    setParams(next)
  }

  const { data: categories } = useCategories()
  const products = useProducts({
    page,
    category: category || undefined,
    search: search || undefined,
    ordering: ordering || undefined,
    in_stock: inStock || undefined,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shop</h1>
        <p className="text-slate-600">Find something you like, or sell your own.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:flex-row sm:items-center">
        <form
          key={search /* reset the box when the URL changes, e.g. back button */}
          className="flex-1"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            const value = new FormData(e.currentTarget).get('search')
            update({ search: String(value ?? '').trim() })
          }}
        >
          <label htmlFor="search" className="sr-only">Search products</label>
          <input
            id="search"
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search products…"
            className="w-full rounded-lg border-0 px-3 py-2 text-sm ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-brand-600"
          />
        </form>
        <label className="sr-only" htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => update({ category: e.target.value })}
          className="rounded-lg border-0 py-2 pr-8 pl-3 text-sm ring-1 ring-slate-300 ring-inset"
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor="ordering">Sort by</label>
        <select
          id="ordering"
          value={ordering}
          onChange={(e) => update({ ordering: e.target.value })}
          className="rounded-lg border-0 py-2 pr-8 pl-3 text-sm ring-1 ring-slate-300 ring-inset"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => update({ in_stock: e.target.checked ? 'true' : '' })}
            className="size-4 rounded border-slate-300 text-brand-600"
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
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            count={products.data.count}
            onChange={(p) => update({ page: String(p) })}
          />
        </>
      )}
    </div>
  )
}
