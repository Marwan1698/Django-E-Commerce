import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Paginated, Product } from '@/lib/types'

export function useMyProducts(page: number) {
  return useQuery({
    queryKey: ['my-products', { page }],
    queryFn: () => api<Paginated<Product>>('/api/products/mine/', { params: { page } }),
    placeholderData: keepPreviousData,
  })
}

function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['my-products'] })
  }
}

export function useSaveProduct(id?: number) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (data: FormData) =>
      id
        ? api<Product>(`/api/products/${id}/`, { method: 'PATCH', body: data })
        : api<Product>('/api/products/', { method: 'POST', body: data }),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (id: number) => api(`/api/products/${id}/`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
