import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

export const PAGE_SIZE = 12

/** @param {{ page?, search?, category?, ordering?, in_stock? }} query */
export function useProducts(query) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => api('/api/products/', { params: query }),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['products', 'detail', String(id)],
    queryFn: () => api(`/api/products/${id}/`),
    enabled: id !== undefined,
    // Open instantly with what the shop grid already loaded; the fresh copy
    // from the API replaces it a moment later.
    placeholderData: () => findInProductLists(queryClient, id),
  })
}

function findInProductLists(queryClient, id) {
  for (const [, data] of queryClient.getQueriesData({ queryKey: ['products'] })) {
    const hit = data?.results?.find((p) => String(p.id) === String(id))
    if (hit) return hit
  }
  return undefined
}

export function useMyProducts(page) {
  return useQuery({
    queryKey: ['my-products', { page }],
    queryFn: () => api('/api/products/mine/', { params: { page } }),
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

/** Create (no id) or update (id) a product from multipart FormData. */
export function useSaveProduct(id) {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (data) =>
      id
        ? api(`/api/products/${id}/`, { method: 'PATCH', body: data })
        : api('/api/products/', { method: 'POST', body: data }),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (id) => api(`/api/products/${id}/`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
