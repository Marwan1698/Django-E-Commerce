import type { ReactNode } from 'react'

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {children && <div className="mt-2 text-sm text-slate-500">{children}</div>}
    </div>
  )
}
