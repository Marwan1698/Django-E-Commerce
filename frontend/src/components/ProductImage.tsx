import type { Product } from '@/lib/types'

/** Product photo, or a tinted placeholder with the product's initial. */
export function ProductImage({ product, className = '' }: { product: Pick<Product, 'name' | 'image'>; className?: string }) {
  if (product.image) {
    return <img src={product.image} alt={product.name} loading="lazy" className={`object-cover ${className}`} />
  }
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-4xl font-semibold text-brand-500 ${className}`}
    >
      {product.name.charAt(0).toUpperCase()}
    </div>
  )
}
