import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, apiClient } from '@/lib/api'
import type { Document, PaginatedResponse } from '@/types'

export function useDocuments(documentType?: string) {
  return useQuery({
    queryKey: ['documents', documentType],
    queryFn: () => api.get<PaginatedResponse<Document>>('/api/documents/', documentType ? { document_type: documentType } : undefined),
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Document>) => api.post<Document>('/api/documents/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useUploadDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, documentName, documentType, notes }: { file: File; documentName: string; documentType: string; notes?: string }) => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('document_name', documentName)
      fd.append('document_type', documentType)
      if (notes) fd.append('notes', notes)
      return apiClient
        .post<Document>('/api/documents/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.del(`/api/documents/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}
