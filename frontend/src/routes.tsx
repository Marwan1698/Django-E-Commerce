import { lazy, Suspense, type ComponentType } from 'react'
import type { RouteObject } from 'react-router'

import { GuestOnly, RequireAuth } from '@/auth/RequireAuth'
import { Layout } from '@/components/Layout'
import { PageSpinner } from '@/components/ui/Spinner'
import { ProductsPage } from '@/features/catalog/ProductsPage'
import { NotFoundPage } from '@/NotFoundPage'

// Every page except the shop front is loaded on demand.
function page(load: () => Promise<Record<string, ComponentType>>, name: string) {
  // eslint-disable-next-line react/only-export-components -- route helper, not a component module
  const Component = lazy(() => load().then((m) => ({ default: m[name] })))
  return (
    <Suspense fallback={<PageSpinner />}>
      <Component />
    </Suspense>
  )
}

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: 'products/:id', element: page(() => import('@/features/catalog/ProductDetailPage'), 'ProductDetailPage') },
      {
        element: <GuestOnly />,
        children: [
          { path: 'login', element: page(() => import('@/features/account/LoginPage'), 'LoginPage') },
          { path: 'register', element: page(() => import('@/features/account/RegisterPage'), 'RegisterPage') },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'cart', element: page(() => import('@/features/cart/CartPage'), 'CartPage') },
          { path: 'checkout', element: page(() => import('@/features/orders/CheckoutPage'), 'CheckoutPage') },
          { path: 'orders', element: page(() => import('@/features/orders/OrdersPage'), 'OrdersPage') },
          { path: 'orders/:id', element: page(() => import('@/features/orders/OrderDetailPage'), 'OrderDetailPage') },
          { path: 'account', element: page(() => import('@/features/account/AccountPage'), 'AccountPage') },
          { path: 'selling', element: page(() => import('@/features/selling/MyProductsPage'), 'MyProductsPage') },
          { path: 'selling/new', element: page(() => import('@/features/selling/ProductFormPage'), 'ProductFormPage') },
          { path: 'selling/:id/edit', element: page(() => import('@/features/selling/ProductFormPage'), 'ProductFormPage') },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
