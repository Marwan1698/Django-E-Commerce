import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/models/user/authContext'
import { api } from '@/shared/api'

const CART_KEY = ['cart']

export function useCart() {
  const { user } = useAuth()
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => api('/api/cart/'),
    enabled: Boolean(user),
  })
}

/** Every cart endpoint returns the updated cart, so we write it straight to the cache. */
function useCartMutation(request) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (cart) => queryClient.setQueryData(CART_KEY, cart),
  })
}

export const useAddToCart = () =>
  useCartMutation(({ productId, quantity = 1 }) =>
    api('/api/cart/items/', { method: 'POST', body: { product_id: productId, quantity } }),
  )

export const useUpdateCartItem = () =>
  useCartMutation(({ itemId, quantity }) => api(`/api/cart/items/${itemId}/`, { method: 'PATCH', body: { quantity } }))

export const useRemoveCartItem = () => useCartMutation((itemId) => api(`/api/cart/items/${itemId}/`, { method: 'DELETE' }))

export const useClearCart = () => useCartMutation(() => api('/api/cart/', { method: 'DELETE' }))
