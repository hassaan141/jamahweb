import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      keepPreviousData: true,
    },
  },
})

export const queryKeys = {
  masjids: ['masjids'],
  organization: (id) => ['organization', id],
  prayerTimes: (orgId, date) => ['prayerTimes', orgId, date],
}
