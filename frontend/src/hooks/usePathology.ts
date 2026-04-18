import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiClient } from '@/lib/api'
import type { PathologyReport, PaginatedResponse } from '@/types'

export function usePathology() {
  return useQuery({
    queryKey: ['pathology'],
    queryFn: () => api.get<PaginatedResponse<PathologyReport>>('/api/pathology/'),
  })
}

export function usePathologyReport(id: number) {
  return useQuery({
    queryKey: ['pathology', id],
    queryFn: () => api.get<PathologyReport>(`/api/pathology/${id}/`),
    enabled: !!id,
  })
}

export function usePathologyTrend(analyteName: string) {
  return useQuery({
    queryKey: ['pathology-trend', analyteName],
    queryFn: () => api.get<{ date: string; value: number; flag: string }[]>('/api/pathology/analyte-trend/', { analyte: analyteName }),
    enabled: !!analyteName,
  })
}

export function useCreatePathology() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PathologyReport>) => api.post<PathologyReport>('/api/pathology/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pathology'] }),
  })
}

export function useUploadPathologyPdf() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const fd = new FormData()
      fd.append('pdf_file', file)
      return apiClient
        .patch<PathologyReport>(`/api/pathology/${id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pathology'] }),
  })
}
