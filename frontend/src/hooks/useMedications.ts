import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Medication, PaginatedResponse } from '@/types'

export function useMedications(status?: string) {
  return useQuery({
    queryKey: ['medications', status],
    queryFn: () => api.get<PaginatedResponse<Medication>>('/api/medications/', status ? { status } : undefined),
  })
}

export function useCreateMedication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Medication>) => api.post<Medication>('/api/medications/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
  })
}

export function useUpdateMedication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Medication> & { id: number }) =>
      api.patch<Medication>(`/api/medications/${id}/`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
  })
}

export function useDeleteMedication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/medications/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
  })
}
