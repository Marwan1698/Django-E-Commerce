import { Link } from 'react-router'

import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState title="Page not found">
      <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">Back to the shop</Link>
    </EmptyState>
  )
}
