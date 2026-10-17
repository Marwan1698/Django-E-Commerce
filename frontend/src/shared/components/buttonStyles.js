const variants = {
  primary: 'bg-navy-900 text-white shadow-sm hover:bg-navy-800',
  secondary: 'bg-white text-navy-900 ring-1 ring-slate-300 ring-inset hover:bg-slate-50',
  light: 'bg-white text-navy-900 hover:bg-navy-50',
  danger: 'bg-white text-red-700 ring-1 ring-red-200 ring-inset hover:bg-red-50',
  ghost: 'text-slate-600 hover:bg-slate-200/60 hover:text-navy-900',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

/** Classes for anything that should look like a button (buttons and links). */
export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  ].join(' ')
}
