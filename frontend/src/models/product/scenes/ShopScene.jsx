import { CategoryPills } from '@/models/category/components/CategoryPills'
import { useAuth } from '@/models/user/authContext'
import { ButtonLink } from '@/shared/components/Button'

import { ProductBrowser } from '../components/ProductBrowser'

export function ShopScene() {
  const { user } = useAuth()
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
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10"
            >
              Browse products
            </a>
          </div>
        </div>
      </section>

      <section id="products" className="scroll-mt-28 space-y-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Latest products</h2>
        <CategoryPills />
        <ProductBrowser />
      </section>
    </div>
  )
}
