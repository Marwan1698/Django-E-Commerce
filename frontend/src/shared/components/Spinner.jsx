export function Spinner({ className = 'size-6' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function PageSpinner() {
  return (
    <div className="flex justify-center py-24 text-navy-700" role="status" aria-label="Loading">
      <Spinner className="size-8" />
    </div>
  )
}
