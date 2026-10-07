import { useQuery } from "@tanstack/react-query";

import {
  getBlynkStatus,
  getDevices,
  getLatestReading,
  getReadingHistory,
  getReadings,
} from "@/features/dashboard/api";

export function useDashboardQueries(
  selectedDeviceId: number | null,
  currentPage: number,
) {
  const devicesQuery = useQuery({
    queryKey: ["devices"],
    queryFn: getDevices,
  });
  const activeDeviceId =
    selectedDeviceId ?? devicesQuery.data?.[0]?.id ?? null;

  const statusQuery = useQuery({
    queryKey: ["blynk-status"],
    queryFn: getBlynkStatus,
    refetchInterval: 5000,
  });

  const latestReadingQuery = useQuery({
    queryKey: ["latest-reading", activeDeviceId],
    queryFn: () => getLatestReading(activeDeviceId ?? undefined),
    enabled: activeDeviceId !== null,
  });

  const historyQuery = useQuery({
    queryKey: ["reading-history", activeDeviceId],
    queryFn: () => {
      if (activeDeviceId === null) {
        throw new Error("A device is required to load reading history.");
      }

      return getReadingHistory(activeDeviceId, { limit: 100 });
    },
    enabled: activeDeviceId !== null,
  });

  const readingsQuery = useQuery({
    queryKey: ["readings", activeDeviceId, currentPage],
    queryFn: () => getReadings(currentPage, 10, activeDeviceId ?? undefined),
    enabled: activeDeviceId !== null,
  });

  const error =
    devicesQuery.error ||
    statusQuery.error ||
    latestReadingQuery.error ||
    historyQuery.error ||
    readingsQuery.error;

  return {
    devices: devicesQuery.data ?? [],
    status: statusQuery.data ?? null,
    latestReading: latestReadingQuery.data ?? null,
    history: historyQuery.data ?? [],
    readings: readingsQuery.data?.items ?? [],
    totalPages: readingsQuery.data?.total_pages ?? 1,
    isLoadingDevices: devicesQuery.isLoading,
    isLoadingStatus: statusQuery.isLoading,
    isLoadingLatest: latestReadingQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isLoadingReadings: readingsQuery.isLoading,
    error: error ? "Unable to load dashboard data." : null,
    refreshStatus: statusQuery.refetch,
  };
}
