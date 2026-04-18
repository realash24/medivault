import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Encounter, PaginatedResponse } from '@/types'

export function useEncounters() {
  return useQuery({
    queryKey: ['encounters'],
    queryFn: () => api.get<PaginatedResponse<Encounter>>('/api/encounters/'),
  })
}

export function useCreateEncounter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Encounter>) => api.post<Encounter>('/api/encounters/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  })
}

export function useUpdateEncounter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Encounter> & { id: number }) =>
      api.patch<Encounter>(`/api/encounters/${id}/`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  })
}

export function useDeleteEncounter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/encounters/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encounters'] }),
  })
}
