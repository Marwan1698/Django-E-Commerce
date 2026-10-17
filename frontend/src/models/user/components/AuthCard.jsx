import { Logo } from '@/shared/components/Logo'

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto max-w-md">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-3 bg-navy-900 px-8 py-6 text-white">
          <Logo className="size-10" />
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-navy-200">{subtitle}</p>}
          </div>
        </div>
        <div className="p-8">{children}</div>
      </div>
      <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>
    </div>
  )
}
