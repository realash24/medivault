import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardSummary, TimelineEvent } from '@/types'

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardSummary>('/api/dashboard/summary/'),
  })
}

export function useTimeline() {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: () => api.get<TimelineEvent[]>('/api/dashboard/timeline/'),
  })
}
