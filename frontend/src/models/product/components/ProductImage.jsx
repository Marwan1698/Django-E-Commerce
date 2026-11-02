/** Product photo, or a soft navy placeholder with the product's initial. */
export function ProductImage({ product, className = '', style, loading = 'lazy' }) {
  if (product.image) {
    return <img src={product.image} alt={product.name} loading={loading} style={style} className={`object-cover ${className}`} />
  }
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`flex items-center justify-center bg-gradient-to-br from-navy-50 to-navy-100 text-4xl font-extrabold text-navy-300 ${className}`}
    >
      {product.name.charAt(0).toUpperCase()}
    </div>
  )
}
