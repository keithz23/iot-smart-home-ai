"use client";

import { useState } from "react";

import { useDashboardQueries } from "@/features/dashboard/hooks/use-dashboard-queries";
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

export function Dashboard() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
          <h1 className="text-xl font-semibold text-slate-900">Không tìm thấy thiết bị</h1>

          <p className="mt-2 text-sm text-slate-500">
            Hãy thêm thiết bị trước khi sử dụng bảng điều khiển.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bảng điều khiển nhà thông minh
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Theo dõi môi trường trong nhà theo thời gian thực
            </p>
          </div>
          <DeviceSelector
            devices={devices}
            selectedDeviceId={activeDeviceId}
            onChange={(deviceId) => {
              setSelectedDeviceId(deviceId);
              setCurrentPage(1);
            }}
          />
        </header>

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-700">
            <p className="text-sm text-red-700">{error}</p>
          </Alert>
        )}

        {/* Latest Reading */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div><CardTitle>Dữ liệu mới nhất</CardTitle>
              <CardDescription>Dữ liệu cảm biến mới nhất được lưu trong cơ sở dữ liệu</CardDescription></div>

            <span className="text-xs text-slate-400">
              {latestReading
                ? new Date(latestReading.recorded_at).toLocaleString("vi-VN")
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
              <SensorCard
                label="Nhiệt độ"
                value={latestReading.temperature}
                unit="°C"
              />

              <SensorCard
                label="Độ ẩm"
                value={latestReading.humidity}
                unit="%"
              />

              <SensorCard
                label="Ánh sáng"
                value={latestReading.light}
                unit="ADC"
              />

              <SensorCard label="Gas" value={latestReading.gas} unit="ADC" />
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
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SensorCard
            label="Nhiệt độ"
            value={status?.temperature ?? null}
            unit="°C"
          />

          <SensorCard
            label="Độ ẩm"
            value={status?.humidity ?? null}
            unit="%"
          />

          <SensorCard label="Ánh sáng" value={status?.light ?? null} unit="ADC" />

          <SensorCard label="Khí gas" value={status?.gas ?? null} unit="ADC" />
        </section>

        {/* Biểu đồ và trạng thái thiết bị */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Environment History */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Lịch sử môi trường</CardTitle>
              <CardDescription>Nhiệt độ và độ ẩm theo thời gian</CardDescription>
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
            <CardHeader><CardTitle>Trạng thái thiết bị</CardTitle></CardHeader>

            <CardContent className="space-y-4">
              <StatusRow
                label="Cửa"
                value={
                  status?.door == null
                    ? "--"
                    : status.door === 1
                      ? "Mở"
                      : "Đóng"
                }
              />

              <StatusRow
                label="Quạt"
                value={
                  status?.fan == null ? "--" : status.fan === 1 ? "ON" : "OFF"
                }
              />

              <StatusRow
                label="Đèn LED"
                value={
                  status?.led == null ? "--" : status.led === 1 ? "ON" : "OFF"
                }
              />

              <StatusRow
                label="Con người"
                value={
                  status?.person == null
                    ? "--"
                    : status.person === 1
                      ? "Phát hiện"
                      : "Không có"
                }
              />

              <StatusRow
                label="Mưa"
                value={
                  status?.rain == null
                    ? "--"
                    : status.rain === 1
                      ? "Phát hiện"
                      : "Không có"
                }
              />
            </CardContent>
          </Card>
        </section>

        <DeviceControl
          roof={status?.roof ?? null}
          fan={status?.fan ?? null}
          led={status?.led ?? null}
          onControlSuccess={async () => {
            await refreshStatus();
          }}
        />

        {/* Bảng lịch sử cảm biến */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Lịch sử cảm biến</CardTitle>
            <CardDescription>Các lần đo gần đây của thiết bị đã chọn</CardDescription>
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
      </div>
    </main>
  );
}

interface StatusRowProps {
  label: string;
  value: string;
}

function StatusRow({ label, value }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
