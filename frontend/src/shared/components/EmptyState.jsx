export function EmptyState({ title, children }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-700">
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16l-1.5 11a2 2 0 0 1-2 1.7h-9a2 2 0 0 1-2-1.7zM9 7V6a3 3 0 0 1 6 0v1" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-navy-900">{title}</h2>
      {children && <div className="mt-2 text-sm text-slate-500">{children}</div>}
    </div>
  )
}
