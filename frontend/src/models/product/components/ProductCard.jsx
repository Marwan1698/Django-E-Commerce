import { Link } from 'react-router'

import { formatPrice } from '@/shared/format'

import { ProductImage } from './ProductImage'

export function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy-900/5"
    >
      <div className="relative">
        <ProductImage product={product} className="aspect-[4/3] w-full rounded-2xl" />
        {!product.in_stock && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 pt-3 pb-2">
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{product.category.name}</p>
        <h3 className="font-bold text-navy-900 group-hover:text-navy-600">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-bold text-navy-900">
            {formatPrice(product.price)}
          </span>
          <span className="flex size-8 items-center justify-center rounded-full bg-navy-900 text-white transition group-hover:bg-navy-700" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  )
}
