import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { VitalSign, PaginatedResponse } from '@/types'

export function useVitals(vitalType?: string) {
  return useQuery({
    queryKey: ['vitals', vitalType],
    queryFn: () => api.get<PaginatedResponse<VitalSign>>('/api/vitals/', vitalType ? { vital_type: vitalType } : undefined),
  })
}

export function useVitalsTrend(vitalType: string) {
  return useQuery({
    queryKey: ['vitals-trend', vitalType],
    queryFn: () => api.get<VitalSign[]>(`/api/vitals/trend/`, { vital_type: vitalType }),
    enabled: !!vitalType,
  })
}

export function useCreateVital() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<VitalSign>) => api.post<VitalSign>('/api/vitals/', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vitals'] })
      qc.invalidateQueries({ queryKey: ['vitals-trend'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
