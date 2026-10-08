import { api } from "@/lib/axios";

import type { Device } from "@/types/device";
import type { AuditLogListResponse } from "@/types/audit-log";
import type {
  BlynkStatus,
  SensorReading,
  SensorReadingListResponse,
} from "@/types/sensor";

export async function getBlynkStatus() {
  const response = await api.get("/blynk/status");

  const data = response.data as BlynkStatus;
  return data;
}

export async function getLatestReading(deviceId?: number) {
  const { data } = await api.get<SensorReading | null>("/readings/latest", {
    params: {
      device_id: deviceId,
    },
  });

  return data;
}

export async function getDevices() {
  const { data } = await api.get<Device[]>("/devices");

  return data;
}

export async function getReadings(page = 1, limit = 10, deviceId?: number) {
  const { data } = await api.get<SensorReadingListResponse>("/readings", {
    params: {
      page,
      limit,
      device_id: deviceId,
    },
  });

  return data;
}

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

export async function controlDevice(
  device: "roof" | "fan" | "led",
  value: 0 | 1,
) {
  const { data } = await api.post("/blynk/control", {
    device,
    value,
  });

  return data;
}

export async function getAuditLogs(page = 1, limit = 10) {
  const { data } = await api.get<AuditLogListResponse>("/audit-logs", {
    params: { page, limit },
  });

  return data;
}
