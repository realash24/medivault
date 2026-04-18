import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Immunisation, PaginatedResponse } from '@/types'

export function useImmunisations() {
  return useQuery({
    queryKey: ['immunisations'],
    queryFn: () => api.get<PaginatedResponse<Immunisation>>('/api/immunisations/'),
  })
}

export function useCreateImmunisation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Immunisation>) => api.post<Immunisation>('/api/immunisations/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['immunisations'] }),
  })
}

export function useUpdateImmunisation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Immunisation> & { id: number }) =>
      api.patch<Immunisation>(`/api/immunisations/${id}/`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['immunisations'] }),
  })
}

export function useDeleteImmunisation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/immunisations/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['immunisations'] }),
  })
}
