import { api } from "@/lib/axios";
import { SensorReading } from "@/types/sensor";

export async function getReadingHistory(
  deviceId: number,
  options?: {
    fromTime?: string;
    toTime?: string;
    limit?: number;
  },
) {
  const { data } = await api.get<SensorReading[]>("/readings/history", {
    params: {
      device_id: deviceId,
      from_time: options?.fromTime,
      to_time: options?.toTime,
      limit: options?.limit ?? 100,
    },
  });

  return data;
}
