const tones = {
  error: 'bg-red-50 text-red-800 ring-red-200',
  success: 'bg-navy-50 text-navy-800 ring-navy-200',
  info: 'bg-slate-50 text-slate-700 ring-slate-200',
}

export function Alert({ tone = 'error', children }) {
  if (!children) return null
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-2xl px-4 py-3 text-sm font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </div>
  )
}
