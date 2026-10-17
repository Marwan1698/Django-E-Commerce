import { Link } from 'react-router'

import { ProductImage } from '@/components/ProductImage'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 transition hover:shadow-md hover:ring-slate-300"
    >
      <ProductImage product={product} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{product.category.name}</p>
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-slate-900">{formatPrice(product.price)}</span>
          {!product.in_stock && <span className="text-xs font-medium text-red-600">Out of stock</span>}
        </div>
      </div>
    </Link>
  )
}
