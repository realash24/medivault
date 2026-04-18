import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Reaction, PaginatedResponse } from '@/types'

export function useReactions() {
  return useQuery({
    queryKey: ['reactions'],
    queryFn: () => api.get<PaginatedResponse<Reaction>>('/api/reactions/'),
  })
}

export function useCreateReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Reaction>) => api.post<Reaction>('/api/reactions/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reactions'] }),
  })
}

export function useUpdateReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Reaction> & { id: number }) =>
      api.patch<Reaction>(`/api/reactions/${id}/`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reactions'] }),
  })
}

export function useDeleteReaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/reactions/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reactions'] }),
  })
}
