import { Button } from './Button'

export function Pagination({ page, pageSize, count, onChange }) {
  const pages = Math.max(1, Math.ceil(count / pageSize))
  if (pages <= 1) return null
  return (
    <nav className="flex items-center justify-center gap-3 pt-8" aria-label="Pagination">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </Button>
      <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-navy-900 ring-1 ring-slate-200">
        {page} / {pages}
      </span>
      <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next →
      </Button>
    </nav>
  )
}
