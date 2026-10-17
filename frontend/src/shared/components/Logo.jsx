/** eStore mark: a market stall with an awning, in navy on a white tile. */
export function Logo({ className = 'size-9' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="#fff" />
      <path d="M7 7.5h18v4.5a3 3 0 0 1-6 0a3 3 0 0 1-6 0a3 3 0 0 1-6 0z" fill="#1c3463" />
      <path d="M9 15.5v9M23 15.5v9M7 24.5h18" fill="none" stroke="#1c3463" strokeWidth="2" strokeLinecap="round" />
      <rect x="12.5" y="18.5" width="7" height="6" rx="1.5" fill="#1c3463" />
    </svg>
  )
}
