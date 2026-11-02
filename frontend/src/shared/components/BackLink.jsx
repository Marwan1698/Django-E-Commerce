import { Link, useLocation, useNavigate } from 'react-router'

/**
 * "← Back" link. If the page was opened from a list that recorded itself in
 * `location.state.from` (e.g. a product card in the shop), it goes back in
 * history instead, so that list's filters and scroll position are restored.
 * Otherwise (direct visit, reload) it links to `to`.
 */
export function BackLink({ to, children }) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const from = typeof state?.from === 'string' ? state.from : undefined

  return (
    <Link
      to={from ?? to}
      onClick={(e) => {
        if (!from || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        navigate(-1)
      }}
      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-navy-800 ring-1 ring-slate-200 hover:bg-navy-50"
    >
      ← {children}
    </Link>
  )
}
