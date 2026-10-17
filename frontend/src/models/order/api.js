import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

export function useOrders(page) {
  return useQuery({
    queryKey: ['orders', { page }],
    queryFn: () => api('/api/orders/', { params: { page } }),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => api(`/api/orders/${id}/`),
    enabled: Boolean(id),
  })
}

/** Checkout: { full_name, phone_number, shipping_address, payment_method } */
export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input) => api('/api/orders/', { method: 'POST', body: input }),
    onSuccess: () => {
      // Stock and the cart changed on the server.
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => api(`/api/orders/${id}/cancel/`, { method: 'POST' }),
    onSuccess: (order) => {
      queryClient.setQueryData(['orders', 'detail', String(order.id)], order)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
