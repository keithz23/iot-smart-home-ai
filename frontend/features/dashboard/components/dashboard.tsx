"use client";

import { useState } from "react";
import { AIChat } from "@/features/ai/components/ai-chat";
import { formatDateTimeVN } from "@/lib/date";

import { useDashboardQueries } from "@/features/dashboard/hooks/use-dashboard-queries";
import type { BlynkStatus } from "@/types/sensor";
import { Alert } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DeviceSelector } from "./device-selector";
import { SensorCard } from "./sensor-card";
import { EnvironmentChart } from "./environment-chart";
import { SensorHistoryTable } from "./sensor-history-table";
import { DeviceControl } from "./device-control";
import { AuditLogTable } from "./audit-log-table";
import {
  DashboardSidebar,
  type DashboardTab,
} from "./dashboard-sidebar";
import {
  ActivityIcon,
  DoorOpen,
  Droplets,
  Lightbulb,
  PersonStanding,
  Radio,
  Thermometer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const SENSOR_METRICS = [
  { label: "Nhiệt độ", key: "temperature", unit: "°C", icon: Thermometer },
  { label: "Độ ẩm", key: "humidity", unit: "%", icon: Droplets },
  { label: "Ánh sáng", key: "light", unit: "ADC", icon: Lightbulb },
  { label: "Gas", key: "gas", unit: "ADC", icon: ActivityIcon },
] as const;

const STATUS_ITEMS = [
  {
    icon: DoorOpen,
    label: "Cửa",
    key: "door",
    activeLabel: "Mở",
    inactiveLabel: "Đóng",
  },
  {
    icon: PersonStanding,
    label: "Con người",
    key: "person",
    activeLabel: "Phát hiện",
    inactiveLabel: "Không có",
  },
  {
    icon: Droplets,
    label: "Mưa",
    key: "rain",
    activeLabel: "Phát hiện",
    inactiveLabel: "Không có",
  },
  {
    icon: Radio,
    label: "Rung động",
    key: "vibration",
    activeLabel: "Phát hiện",
    inactiveLabel: "Bình thường",
  },
] as const;

export function Dashboard({ onLogout }: { onLogout: () => Promise<void> }) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const {
    devices,
    status,
    latestReading,
    history,
    readings,
    totalPages,
    isLoadingDevices,
    isLoadingLatest,
    isLoadingHistory,
    isLoadingReadings,
    error,
    refreshStatus,
    auditLogs,
    isLoadingAuditLogs,
  } = useDashboardQueries(selectedDeviceId, currentPage);
  const activeDeviceId =
    selectedDeviceId ?? (devices.length > 0 ? devices[0].id : null);

  if (isLoadingDevices) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Đang tải bảng điều khiển...</p>
      </main>
    );
  }

  if (!isLoadingDevices && devices.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Không tìm thấy thiết bị
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Hãy thêm thiết bị trước khi sử dụng bảng điều khiển.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={onLogout}
        />
        <div className="min-w-0 space-y-6">
        <header className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Bảng điều khiển nhà thông minh
                </h1>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                  Online
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Theo dõi và điều khiển hệ thống nhà thông minh theo thời gian
                thực
              </p>

              {activeDeviceId && (
                <p className="mt-2 text-xs text-slate-400">
                  Device ID: {activeDeviceId}
                </p>
              )}
            </div>

            <DeviceSelector
              devices={devices}
              selectedDeviceId={activeDeviceId}
              onChange={(deviceId) => {
                setSelectedDeviceId(deviceId);
                setCurrentPage(1);
              }}
            />
          </div>
        </header>

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-700">
            <p className="text-sm text-red-700">{error}</p>
          </Alert>
        )}

        {activeTab === "overview" && (
          <>
        {/* Latest Reading */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Dữ liệu mới nhất</CardTitle>
              <CardDescription>
                Dữ liệu cảm biến mới nhất được lưu trong cơ sở dữ liệu
              </CardDescription>
            </div>

            <span className="text-xs text-slate-400">
              {latestReading
                ? formatDateTimeVN(latestReading.recorded_at)
                : "--"}
            </span>
          </CardHeader>

          <CardContent>
            {isLoadingLatest ? (
              <div className="mt-5 flex h-32 items-center justify-center">
                <p className="text-sm text-slate-400">
                  Đang tải dữ liệu mới nhất...
                </p>
              </div>
            ) : latestReading ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {SENSOR_METRICS.map(({ label, key, unit, icon }) => (
                  <SensorCard
                    key={key}
                    label={label}
                    value={latestReading[key]}
                    unit={unit}
                    icon={icon}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 flex h-32 items-center justify-center rounded-lg bg-slate-50">
                <p className="text-sm text-slate-400">
                  Chưa có dữ liệu mới nhất
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trạng thái cảm biến Blynk hiện tại */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Môi trường hiện tại
              </h2>

              <p className="text-sm text-slate-500">
                Dữ liệu cảm biến theo thời gian thực
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SENSOR_METRICS.map(({ label, key, unit, icon }) => (
              <SensorCard
                key={key}
                label={label}
                value={status?.[key] ?? null}
                unit={unit}
                icon={icon}
              />
            ))}
          </div>

          {latestReading && (
            <p className="mt-3 text-xs text-slate-400">
              Bản ghi lưu gần nhất:{" "}
              {formatDateTimeVN(latestReading.recorded_at)}
            </p>
          )}
        </section>

        {/* Biểu đồ và trạng thái thiết bị */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Environment History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Lịch sử môi trường</CardTitle>
              <CardDescription>
                Nhiệt độ và độ ẩm theo thời gian
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isLoadingHistory ? (
                <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-400">Đang tải lịch sử...</p>
                </div>
              ) : history.length > 0 ? (
                <EnvironmentChart readings={history} />
              ) : (
                <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-400">
                    Chưa có dữ liệu lịch sử
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái thiết bị</CardTitle>
              <CardDescription>
                Trạng thái các cảm biến và thiết bị giám sát
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {STATUS_ITEMS.map(
                ({ icon, label, key, activeLabel, inactiveLabel }) => (
                  <StatusRow
                    key={key}
                    icon={icon}
                    label={label}
                    value={formatStatusValue(
                      status,
                      key,
                      activeLabel,
                      inactiveLabel,
                    )}
                  />
                ),
              )}
            </CardContent>
          </Card>
        </section>

        <DeviceControl
          roof={status?.roof ?? null}
          fan={status?.fan ?? null}
          led={status?.led ?? null}
          isLoading={!status}
          onControlSuccess={async () => {
            await refreshStatus();
          }}
        />
          </>
        )}

        {/* Bảng lịch sử cảm biến */}
        {activeTab === "history" && (
          <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Lịch sử cảm biến</CardTitle>
            <CardDescription>
              Các lần đo gần đây của thiết bị đã chọn
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SensorHistoryTable
              readings={readings}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoadingReadings}
            />
          </CardContent>
          </Card>
        )}

        {activeTab === "audit" && (
          <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Audit logs</CardTitle>
            <CardDescription>
              Lịch sử đăng nhập, điều khiển thiết bị và đồng bộ dữ liệu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuditLogTable logs={auditLogs} isLoading={isLoadingAuditLogs} />
          </CardContent>
          </Card>
        )}
        </div>
      </div>
      <AIChat />
    </main>
  );
}

interface StatusRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function StatusRow({ icon: Icon, label, value }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Icon size={18} />
        </div>

        <span className="text-sm text-slate-600">{label}</span>
      </div>

      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function formatStatusValue(
  status: BlynkStatus | null,
  key: "door" | "person" | "rain" | "vibration",
  activeLabel: string,
  inactiveLabel: string,
) {
  const value = status?.[key];

  return value == null ? "--" : value === 1 ? activeLabel : inactiveLabel;
}
