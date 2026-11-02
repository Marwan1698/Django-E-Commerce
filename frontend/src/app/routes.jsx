import { lazy, Suspense } from 'react'

import { RequireAuth, GuestOnly } from '@/models/user/components/RequireAuth'
import { ProductDetailScene } from '@/models/product/scenes/ProductDetailScene'
import { ShopScene } from '@/models/product/scenes/ShopScene'
import { PageSpinner } from '@/shared/components/Spinner'
import { NotFoundScene } from '@/shared/scenes/NotFoundScene'

import { Layout } from './Layout'

// Scenes load on demand, except the shop and the product page it opens
// (bundled together so opening a product never waits on a code download).
function scene(load, name) {
  // eslint-disable-next-line react/only-export-components -- route helper, not a component module
  const Scene = lazy(() => load().then((m) => ({ default: m[name] })))
  return (
    <Suspense fallback={<PageSpinner />}>
      <Scene />
    </Suspense>
  )
}

export const routes = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <ShopScene />, handle: { page: 'shop' } },
      // Same component as the index route, so switching category doesn't remount the page.
      { path: 'categories/:slug', element: <ShopScene />, handle: { page: 'shop' } },
      { path: 'products/:id', element: <ProductDetailScene /> },
      {
        element: <GuestOnly />,
        children: [
          { path: 'login', element: scene(() => import('@/models/user/scenes/LoginScene'), 'LoginScene') },
          { path: 'register', element: scene(() => import('@/models/user/scenes/RegisterScene'), 'RegisterScene') },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'account', element: scene(() => import('@/models/user/scenes/AccountScene'), 'AccountScene') },
          { path: 'cart', element: scene(() => import('@/models/cart/scenes/CartScene'), 'CartScene') },
          { path: 'checkout', element: scene(() => import('@/models/order/scenes/CheckoutScene'), 'CheckoutScene') },
          { path: 'orders', element: scene(() => import('@/models/order/scenes/OrdersScene'), 'OrdersScene') },
          { path: 'orders/:id', element: scene(() => import('@/models/order/scenes/OrderDetailScene'), 'OrderDetailScene') },
          { path: 'selling', element: scene(() => import('@/models/product/scenes/MyProductsScene'), 'MyProductsScene') },
          { path: 'selling/new', element: scene(() => import('@/models/product/scenes/ProductEditorScene'), 'ProductEditorScene') },
          { path: 'selling/:id/edit', element: scene(() => import('@/models/product/scenes/ProductEditorScene'), 'ProductEditorScene') },
        ],
      },
      { path: '*', element: <NotFoundScene /> },
    ],
  },
]
