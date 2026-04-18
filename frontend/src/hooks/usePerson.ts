import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Person } from '@/types'

export function usePerson() {
  return useQuery({
    queryKey: ['person'],
    queryFn: () => api.get<Person>('/api/person/me/'),
  })
}

export function useUpdatePerson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Person>) => api.patch<Person>('/api/person/me/', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['person'] }),
  })
}
