import type { ReactNode } from 'react'

const tones = {
  error: 'bg-red-50 text-red-700 ring-red-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  info: 'bg-brand-50 text-brand-700 ring-brand-100',
}

export function Alert({ tone = 'error', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  if (!children) return null
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </div>
  )
}
