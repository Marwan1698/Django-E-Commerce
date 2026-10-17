import type { ButtonHTMLAttributes } from 'react'

import { Spinner } from './Spinner'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/60',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50',
  danger: 'bg-white text-red-600 ring-1 ring-red-200 ring-inset hover:bg-red-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  loading?: boolean
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: Props) {
  const sizing = size === 'sm' ? 'px-2.5 py-1.5 text-sm' : 'px-4 py-2 text-sm'
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60 ${sizing} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}
