import { useParams } from 'react-router'

import { useCategories } from '@/models/category/api'
import { CategoryPills } from '@/models/category/components/CategoryPills'
import { useAuth } from '@/models/user/authContext'
import { ButtonLink } from '@/shared/components/Button'
import { scrollToElement } from '@/shared/scroll'
import { NotFoundScene } from '@/shared/scenes/NotFoundScene'

import { ProductBrowser } from '../components/ProductBrowser'

/**
 * The shop front. Serves both `/` and `/categories/:slug`: the two routes
 * render this same component, so switching category keeps the hero, the
 * scroll position and the current grid on screen while the new results load.
 */
export function ShopScene() {
  const { user } = useAuth()
  const { slug } = useParams()
  const { data: categories } = useCategories()
  const category = slug ? categories?.find((c) => c.slug === slug) : undefined
  if (slug && categories && !category) return <NotFoundScene />

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-12 text-white sm:px-12 sm:py-16">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-72 rounded-full bg-navy-700/60" />
        <div aria-hidden="true" className="absolute -right-10 -bottom-32 size-64 rounded-full bg-navy-800" />
        <div className="relative max-w-xl">
          <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-navy-100 uppercase">
            The open marketplace
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Buy and sell, all in one place.</h1>
          <p className="mt-4 text-lg text-navy-200">
            Find great things from people near you, or turn what you don’t need into cash.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={user ? '/selling/new' : '/register'} variant="light" size="lg">
              Start selling
            </ButtonLink>
            <a
              href="#products"
              onClick={(e) => {
                // Scroll without adding #products to the URL / history.
                e.preventDefault()
                scrollToElement(document.getElementById('products'))
              }}
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10"
            >
              Browse products
            </a>
          </div>
        </div>
      </section>

      <section id="products" className="scroll-mt-28 space-y-6">
        {/* Same two lines for "All" and every category, so the pills below never shift. */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {slug ? (category?.name ?? ' ') : 'Latest products'}
          </h2>
          <p className="mt-1 text-slate-500">
            {slug
              ? category ? `Everything in ${category.name.toLowerCase()}.` : ' '
              : 'Fresh listings from across the marketplace.'}
          </p>
        </div>
        <CategoryPills />
        <ProductBrowser category={slug} />
      </section>
    </div>
  )
}
