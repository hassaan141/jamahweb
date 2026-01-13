import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
      refetchOnMount: false, 
      refetchOnReconnect: false,
      keepPreviousData: true,
    },
  },
})

export const queryKeys = {
  masjids: ['masjids'],
  organization: (id) => ['organization', id],
  prayerTimes: (orgId, date) => ['prayerTimes', orgId, date],
}