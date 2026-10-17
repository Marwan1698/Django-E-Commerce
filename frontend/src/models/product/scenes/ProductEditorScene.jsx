import { useParams } from 'react-router'

import { useAuth } from '@/models/user/authContext'
import { describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { BackLink } from '@/shared/components/BackLink'
import { Card } from '@/shared/components/Card'
import { PageHeader } from '@/shared/components/PageHeader'
import { PageSpinner } from '@/shared/components/Spinner'

import { useProduct } from '../api'
import { ProductForm } from '../components/ProductForm'

/** /selling/new and /selling/:id/edit */
export function ProductEditorScene() {
  const { id } = useParams()
  const { user } = useAuth()
  const existing = useProduct(id)
  const isEdit = id !== undefined

  let body
  if (!isEdit) body = <ProductForm />
  else if (existing.isPending) body = <PageSpinner />
  else if (existing.error) body = <Alert>{describeError(existing.error)}</Alert>
  else if (existing.data.seller !== user?.username && !user?.is_staff) body = <Alert>You can only edit your own listings.</Alert>
  else body = <ProductForm product={existing.data} />

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink to="/selling">Your listings</BackLink>
      <PageHeader title={isEdit ? 'Edit listing' : 'List a product'} />
      <Card className="p-6 sm:p-8">{body}</Card>
    </div>
  )
}
