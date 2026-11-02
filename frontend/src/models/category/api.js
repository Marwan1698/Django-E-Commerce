import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api('/api/categories/'),
    staleTime: 5 * 60_000,
  })
}
