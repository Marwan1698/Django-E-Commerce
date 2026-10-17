const styles = {
  pending: 'bg-white text-slate-700 ring-1 ring-slate-300 ring-inset',
  processing: 'bg-navy-50 text-navy-700',
  shipped: 'bg-navy-100 text-navy-800',
  delivered: 'bg-navy-900 text-white',
  cancelled: 'bg-white text-slate-400 ring-1 ring-slate-200 ring-inset',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[status] ?? styles.pending}`}>
      {status}
    </span>
  )
}
