import { Link, useLocation, useViewTransitionState } from 'react-router'

import { QuickAddToCart } from '@/models/cart/components/QuickAddToCart'
import { formatPrice } from '@/shared/format'

import { ProductImage } from './ProductImage'

/**
 * The whole card opens the product (the title link is stretched over it);
 * the add-to-cart control sits above that link so it can be used in place.
 * Opening it morphs the picture into the product page's picture.
 */
export function ProductCard({ product, className = '', style }) {
  const { pathname, search } = useLocation()
  const to = `/products/${product.id}`
  // Only the card being opened (or returned to) takes part in the morph.
  const morphing = useViewTransitionState(to)
  return (
    <article
      style={style}
      className={`group relative flex flex-col rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200/70 transition duration-300 ease-snappy hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10 ${className}`}
    >
      <div className="relative overflow-hidden rounded-2xl" style={morphing ? { viewTransitionName: 'product-image' } : undefined}>
        <ProductImage product={product} className="aspect-[4/3] w-full transition duration-500 ease-snappy group-hover:scale-[1.04]" />
        {!product.in_stock && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 pt-3 pb-2">
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{product.category.name}</p>
        <h3 className="font-bold text-navy-900 group-hover:text-navy-600">
          <Link
            to={to}
            viewTransition
            state={{ from: pathname + search /* lets "Back to shop" restore filters and scroll */ }}
            className="after:absolute after:inset-0 after:rounded-3xl focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-navy-600"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="rounded-full bg-navy-50 px-3 py-1 text-sm font-bold text-navy-900">
            {formatPrice(product.price)}
          </span>
          <div className="relative z-10">
            <QuickAddToCart product={product} />
          </div>
        </div>
      </div>
    </article>
  )
}
