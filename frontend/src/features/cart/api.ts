import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/auth/AuthContext'
import { api } from '@/lib/api'
import type { Cart } from '@/lib/types'

const CART_KEY = ['cart']

export function useCart() {
  const { user } = useAuth()
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => api<Cart>('/api/cart/'),
    enabled: !!user,
  })
}

/** Every cart endpoint returns the updated cart, so we just write it to the cache. */
function useCartMutation<V>(request: (vars: V) => Promise<Cart>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  })
}

export const useAddToCart = () =>
  useCartMutation(({ productId, quantity = 1 }: { productId: number; quantity?: number }) =>
    api<Cart>('/api/cart/items/', { method: 'POST', body: { product_id: productId, quantity } }),
  )

export const useUpdateCartItem = () =>
  useCartMutation(({ itemId, quantity }: { itemId: number; quantity: number }) =>
    api<Cart>(`/api/cart/items/${itemId}/`, { method: 'PATCH', body: { quantity } }),
  )

export const useRemoveCartItem = () =>
  useCartMutation((itemId: number) => api<Cart>(`/api/cart/items/${itemId}/`, { method: 'DELETE' }))

export const useClearCart = () => useCartMutation(() => api<Cart>('/api/cart/', { method: 'DELETE' }))
