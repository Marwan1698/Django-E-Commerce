import { NavLink } from 'react-router'

import { useCart } from '../api'

/** "Cart" nav link with a live item count. */
export function CartNavLink({ className, onClick }) {
  const { data: cart } = useCart()
  const count = cart?.item_count ?? 0
  return (
    <NavLink to="/cart" className={className} onClick={onClick}>
      Cart
      {count > 0 && (
        <span className="ml-1.5 inline-flex min-w-5 justify-center rounded-full bg-white px-1.5 text-xs font-bold text-navy-900">
          {count}
          <span className="sr-only"> items</span>
        </span>
      )}
    </NavLink>
  )
}
