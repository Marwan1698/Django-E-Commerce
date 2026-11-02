import { Link } from 'react-router'

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-navy-800 ring-1 ring-slate-200 hover:bg-navy-50"
    >
      ← {children}
    </Link>
  )
}
