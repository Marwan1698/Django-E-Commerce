import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'

import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { EmptyState } from '@/shared/components/EmptyState'
import { Pagination } from '@/shared/components/Pagination'
import { Select } from '@/shared/components/Select'
import { PageSpinner } from '@/shared/components/Spinner'
import { scrollToElement } from '@/shared/scroll'

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
 * the URL so results can be shared and survive reloads. Changing a filter
 * keeps the scroll position (no jump back to the top of the page) and keeps
 * the previous results on screen, dimmed, until the new ones arrive.
 */
export function ProductBrowser({ category }) {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const search = params.get('search') ?? ''
  const ordering = params.get('ordering') ?? ''
  const inStock = params.get('in_stock') === 'true'
  const top = useRef(null)

  // The search box is a draft until submitted; it follows the URL when that
  // changes from elsewhere (back button, a category link, …).
  const [draft, setDraft] = useState(search)
  const [syncedSearch, setSyncedSearch] = useState(search)
  if (search !== syncedSearch) {
    setSyncedSearch(search)
    setDraft(search)
  }

  const update = (changes) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page') // a new filter starts at page 1
    setParams(next, { preventScrollReset: true })
  }

  const products = useProducts({
    page,
    category,
    search: search || undefined,
    ordering: ordering || undefined,
    in_stock: inStock || undefined,
  })

  // New results (filter, sort, page) stagger in. Results already cached when
  // the grid mounts (e.g. coming back from a product) appear without animating.
  const shownIds = products.data?.results.map((p) => p.id).join(',')
  const [idsAtMount] = useState(() => (products.isPending ? null : shownIds))
  const animateIn = shownIds !== idsAtMount

  return (
    // min-h: a short result list (one book, or "no products") must not shrink
    // the page, or the browser would pull the scroll position up and the
    // filters you just clicked would jump away under the navbar.
    <div ref={top} className="min-h-[calc(100dvh-7rem)] scroll-mt-28 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          role="search"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            update({ search: draft.trim() })
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
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              // Clearing the box (or its ✕ button) clears the search right away.
              if (!e.target.value && search) update({ search: '' })
            }}
            placeholder="Search products…"
            className={`${control} w-full pr-4 pl-10`}
          />
        </form>
        <Select prefix="Sort:" value={ordering} onChange={(value) => update({ ordering: value })} options={SORTS} className="sm:w-60" />
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
        <div className="relative">
          {products.isPlaceholderData && (
            <div className="absolute inset-x-0 -top-3 h-0.5 overflow-hidden rounded-full bg-navy-100" role="status" aria-label="Loading results">
              <div className="h-full w-2/5 animate-loading-bar rounded-full bg-navy-600" />
            </div>
          )}
          <div
            key={shownIds}
            className={`grid grid-cols-1 gap-5 transition duration-300 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${products.isPlaceholderData ? 'opacity-50 saturate-50' : ''}`}
          >
            {products.data.results.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                className={animateIn ? 'animate-rise' : ''}
                style={animateIn ? { animationDelay: `${Math.min(i, 8) * 40}ms` } : undefined}
              />
            ))}
          </div>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            count={products.data.count}
            onChange={(p) => {
              update({ page: String(p) })
              scrollToElement(top.current)
            }}
          />
        </div>
      )}
    </div>
  )
}
