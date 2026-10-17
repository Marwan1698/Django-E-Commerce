import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Category, Paginated, Product } from '@/lib/types'

export const PAGE_SIZE = 12

export interface ProductQuery {
  page?: number
  search?: string
  category?: string
  ordering?: string
  in_stock?: boolean
}

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => api<Paginated<Product>>('/api/products/', { params: { ...query } }),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string | number | undefined) {
  return useQuery({
    queryKey: ['products', 'detail', String(id)],
    queryFn: () => api<Product>(`/api/products/${id}/`),
    enabled: id !== undefined,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/api/categories/'),
    staleTime: 5 * 60_000,
  })
}
