import { NavLink, useSearchParams } from 'react-router'

import { useCategories } from '../api'

const pill = ({ isActive }) =>
  `shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
    isActive ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-800 ring-slate-200 hover:bg-navy-50'
  }`

/**
 * Horizontal, scrollable list of category links. Switching category keeps
 * the other filters (search, sort, stock) and the scroll position; only the
 * page number resets.
 */
export function CategoryPills() {
  const { data: categories } = useCategories()
  const [params] = useSearchParams()
  if (!categories?.length) return null

  const kept = new URLSearchParams(params)
  kept.delete('page')
  const query = kept.toString()
  const search = query ? `?${query}` : ''

  return (
    <nav aria-label="Categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <NavLink to={{ pathname: '/', search }} end preventScrollReset className={pill}>
        All
      </NavLink>
      {categories.map((c) => (
        <NavLink key={c.id} to={{ pathname: `/categories/${c.slug}`, search }} preventScrollReset className={pill}>
          {c.name}
        </NavLink>
      ))}
    </nav>
  )
}
