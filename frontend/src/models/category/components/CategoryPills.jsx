import { NavLink } from 'react-router'

import { useCategories } from '../api'

const pill = ({ isActive }) =>
  `shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
    isActive ? 'bg-navy-900 text-white ring-navy-900' : 'bg-white text-navy-800 ring-slate-200 hover:bg-navy-50'
  }`

/** Horizontal, scrollable list of category links. */
export function CategoryPills() {
  const { data: categories } = useCategories()
  if (!categories?.length) return null
  return (
    <nav aria-label="Categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <NavLink to="/" end className={pill}>
        All
      </NavLink>
      {categories.map((c) => (
        <NavLink key={c.id} to={`/categories/${c.slug}`} className={pill}>
          {c.name}
        </NavLink>
      ))}
    </nav>
  )
}
