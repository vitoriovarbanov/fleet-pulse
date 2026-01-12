'use client';

import { api } from '@/trpc/react';

const POLLING_INTERVAL = 30000; // 30 seconds
const STALE_TIME = 25000; // 25 seconds

export function useDashboardData() {
  const {
    data: vehicles = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = api.vehicles.listWithLocation.useQuery(undefined, {
    refetchInterval: POLLING_INTERVAL,
    staleTime: STALE_TIME,
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });

  return {
    vehicles,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
