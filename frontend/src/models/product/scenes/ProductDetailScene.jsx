import { Link, useParams } from 'react-router'

import { AddToCartForm } from '@/models/cart/components/AddToCartForm'
import { useAuth } from '@/models/user/authContext'
import { ApiError, describeError } from '@/shared/api'
import { Alert } from '@/shared/components/Alert'
import { BackLink } from '@/shared/components/BackLink'
import { ButtonLink } from '@/shared/components/Button'
import { Card } from '@/shared/components/Card'
import { PageSpinner } from '@/shared/components/Spinner'
import { formatPrice } from '@/shared/format'

import { useProduct } from '../api'
import { ProductImage } from '../components/ProductImage'

export function ProductDetailScene() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: product, isPending, error } = useProduct(id)

  if (isPending) return <PageSpinner />
  if (error) {
    return <Alert>{error instanceof ApiError && error.status === 404 ? 'This product does not exist.' : describeError(error)}</Alert>
  }

  const isOwner = user?.username === product.seller

  return (
    <div className="space-y-6">
      <BackLink to="/">Back to shop</BackLink>
      <Card className="grid gap-8 p-3 md:grid-cols-2 md:p-4">
        <ProductImage product={product} className="aspect-square w-full rounded-[1.5rem]" />
        <div className="flex flex-col gap-5 p-3 md:p-6">
          <div>
            <Link
              to={`/categories/${product.category.slug}`}
              className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase hover:bg-navy-50"
            >
              {product.category.name}
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Sold by <span className="font-semibold text-navy-800">{product.seller}</span>
            </p>
          </div>
          <p className="text-3xl font-extrabold text-navy-900">{formatPrice(product.price)}</p>
          {product.description && <p className="leading-relaxed whitespace-pre-line text-slate-600">{product.description}</p>}
          <p className="flex items-center gap-2 text-sm font-semibold text-navy-800">
            <span className={`size-2.5 rounded-full ${product.in_stock ? 'bg-navy-600' : 'bg-slate-300'}`} aria-hidden="true" />
            {product.in_stock ? `${product.stock} in stock` : 'Sold out'}
          </p>
          <div className="mt-auto">
            {isOwner ? (
              <ButtonLink to={`/selling/${product.id}/edit`}>Edit listing</ButtonLink>
            ) : (
              product.in_stock && <AddToCartForm product={product} />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
