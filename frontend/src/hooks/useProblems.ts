import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Problem, PaginatedResponse } from '@/types'

export function useProblems(status?: string) {
  return useQuery({
    queryKey: ['problems', status],
    queryFn: () => api.get<PaginatedResponse<Problem>>('/api/problems/', status ? { status } : undefined),
  })
}

export function useCreateProblem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Problem>) => api.post<Problem>('/api/problems/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['problems'] }),
  })
}

export function useUpdateProblem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Problem> & { id: number }) =>
      api.patch<Problem>(`/api/problems/${id}/`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['problems'] }),
  })
}

export function useDeleteProblem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/problems/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['problems'] }),
  })
}
