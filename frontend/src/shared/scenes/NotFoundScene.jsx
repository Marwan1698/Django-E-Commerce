import { ButtonLink } from '@/shared/components/Button'
import { EmptyState } from '@/shared/components/EmptyState'

export function NotFoundScene() {
  return (
    <EmptyState title="Page not found">
      <p>The page you’re looking for doesn’t exist.</p>
      <ButtonLink to="/" className="mt-4">Back to the shop</ButtonLink>
    </EmptyState>
  )
}
