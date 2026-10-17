import { lazy, Suspense } from 'react'

import { RequireAuth, GuestOnly } from '@/models/user/components/RequireAuth'
import { ShopScene } from '@/models/product/scenes/ShopScene'
import { PageSpinner } from '@/shared/components/Spinner'
import { NotFoundScene } from '@/shared/scenes/NotFoundScene'

import { Layout } from './Layout'

// Every scene except the shop front is loaded on demand.
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
      { index: true, element: <ShopScene /> },
      { path: 'categories/:slug', element: scene(() => import('@/models/category/scenes/CategoryScene'), 'CategoryScene') },
      { path: 'products/:id', element: scene(() => import('@/models/product/scenes/ProductDetailScene'), 'ProductDetailScene') },
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
