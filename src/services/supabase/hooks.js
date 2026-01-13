import { useQuery, useQueries } from '@tanstack/react-query'
import { fetchMasjids, fetchOrganizationById, fetchDailyPrayerTimes } from './api'
import { queryKeys } from './queryClient'

export function useMasjids() {
  return useQuery({
    queryKey: queryKeys.masjids,
    queryFn: async () => {
      const { data, error } = await fetchMasjids()
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

export function useOrganization(id) {
  return useQuery({
    queryKey: queryKeys.organization(id),
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await fetchOrganizationById(id)
      if (error) throw error
      return data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePrayerTimes(orgId, date) {
  return useQuery({
    queryKey: queryKeys.prayerTimes(orgId, date?.toISOString?.() || date),
    queryFn: async () => {
      if (!orgId || !date) return null
      const { data, error } = await fetchDailyPrayerTimes(orgId, date)
      if (error) throw error
      return data
    },
    enabled: !!orgId && !!date,
    staleTime: 60 * 1000,
    cacheTime: 5 * 60 * 1000,
  })
}

export function useMultiplePrayerTimes(orgId, dates) {
  return useQueries({
    queries: dates.map((date) => ({
      queryKey: queryKeys.prayerTimes(orgId, date?.toISOString?.() || date),
      queryFn: async () => {
        if (!orgId || !date) return null
        const { data, error } = await fetchDailyPrayerTimes(orgId, date)
        if (error) throw error
        return data
      },
      enabled: !!orgId && !!date,
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    })),
  })
}
