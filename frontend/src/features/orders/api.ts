import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Order, Paginated } from '@/lib/types'

export interface CheckoutInput {
  full_name: string
  phone_number: string
  shipping_address: string
  payment_method: 'cash_on_delivery'
}

export function useOrders(page: number) {
  return useQuery({
    queryKey: ['orders', { page }],
    queryFn: () => api<Paginated<Order>>('/api/orders/', { params: { page } }),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => api<Order>(`/api/orders/${id}/`),
    enabled: !!id,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CheckoutInput) => api<Order>('/api/orders/', { method: 'POST', body: input }),
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
    mutationFn: (id: number) => api<Order>(`/api/orders/${id}/cancel/`, { method: 'POST' }),
    onSuccess: (order) => {
      queryClient.setQueryData(['orders', 'detail', String(order.id)], order)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
