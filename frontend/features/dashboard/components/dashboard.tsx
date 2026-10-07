"use client";

import { useEffect, useState } from "react";

import {
  getBlynkStatus,
  getDevices,
  getLatestReading,
  getReadingHistory,
  getReadings,
} from "@/features/dashboard/api";

import type { BlynkStatus, SensorReading } from "@/types/sensor";

import type { Device } from "@/types/device";

import { DeviceSelector } from "./device-selector";
import { SensorCard } from "./sensor-card";
import { EnvironmentChart } from "./environment-chart";
import { SensorHistoryTable } from "./sensor-history-table";
import { DeviceControl } from "./device-control";

export function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  const [status, setStatus] = useState<BlynkStatus | null>(null);

  const [latestReading, setLatestReading] = useState<SensorReading | null>(
    null,
  );

  // Used for EnvironmentChart
  const [history, setHistory] = useState<SensorReading[]>([]);

  // Used for SensorHistoryTable pagination
  const [readings, setReadings] = useState<SensorReading[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoadingDevices, setIsLoadingDevices] = useState(true);

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const [isLoadingLatest, setIsLoadingLatest] = useState(false);

  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isLoadingReadings, setIsLoadingReadings] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Reset table page when changing device
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDeviceId]);

  // Load devices
  useEffect(() => {
    async function loadDevices() {
      try {
        setIsLoadingDevices(true);
        setError(null);

        const data = await getDevices();

        setDevices(data);

        if (data.length > 0) {
          setSelectedDeviceId(data[0].id);
        }
      } catch {
        setError("Unable to load devices.");
      } finally {
        setIsLoadingDevices(false);
      }
    }

    loadDevices();
  }, []);

  // Load Blynk status
  useEffect(() => {
    async function loadStatus() {
      try {
        setIsLoadingStatus(true);

        const data = await getBlynkStatus();

        setStatus(data);
      } catch {
        setError("Unable to load Blynk status.");
      } finally {
        setIsLoadingStatus(false);
      }
    }

    loadStatus();
  }, [selectedDeviceId]);

  // Load latest database reading
  useEffect(() => {
    if (selectedDeviceId === null) {
      setLatestReading(null);
      return;
    }

    async function loadLatestReading() {
      try {
        setIsLoadingLatest(true);

        const data = await getLatestReading(selectedDeviceId);

        setLatestReading(data);
      } catch {
        setError("Unable to load latest reading.");
      } finally {
        setIsLoadingLatest(false);
      }
    }

    loadLatestReading();
  }, [selectedDeviceId]);

  // Load history for chart
  useEffect(() => {
    if (selectedDeviceId === null) {
      setHistory([]);
      return;
    }

    async function loadHistory() {
      try {
        setIsLoadingHistory(true);

        const data = await getReadingHistory(selectedDeviceId, {
          limit: 100,
        });

        setHistory(data);
      } catch {
        setError("Unable to load historical data.");
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadHistory();
  }, [selectedDeviceId]);

  // Load paginated readings for table
  useEffect(() => {
    if (selectedDeviceId === null) {
      setReadings([]);
      return;
    }

    async function loadReadings() {
      try {
        setIsLoadingReadings(true);

        const data = await getReadings(currentPage, 10, selectedDeviceId);

        setReadings(data.items);
        setTotalPages(data.total_pages);
      } catch {
        setError("Unable to load sensor readings.");
      } finally {
        setIsLoadingReadings(false);
      }
    }

    loadReadings();
  }, [selectedDeviceId, currentPage]);

  if (isLoadingDevices) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </main>
    );
  }

  if (!isLoadingDevices && devices.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            No devices found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Add a device before using the dashboard.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Smart Home Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor your home environment in real time
            </p>
          </div>

          <DeviceSelector
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onChange={setSelectedDeviceId}
          />
        </header>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Latest Reading */}
        <section className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Latest Reading
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest sensor data stored in the database
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {latestReading
                ? new Date(latestReading.recorded_at).toLocaleString()
                : "--"}
            </span>
          </div>

          {isLoadingLatest ? (
            <div className="mt-5 flex h-32 items-center justify-center">
              <p className="text-sm text-slate-400">
                Loading latest reading...
              </p>
            </div>
          ) : latestReading ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SensorCard
                label="Temperature"
                value={latestReading.temperature}
                unit="°C"
              />

              <SensorCard
                label="Humidity"
                value={latestReading.humidity}
                unit="%"
              />

              <SensorCard
                label="Light"
                value={latestReading.light}
                unit="ADC"
              />

              <SensorCard label="Gas" value={latestReading.gas} unit="ADC" />
            </div>
          ) : (
            <div className="mt-5 flex h-32 items-center justify-center rounded-lg bg-slate-50">
              <p className="text-sm text-slate-400">
                No latest reading available
              </p>
            </div>
          )}
        </section>

        {/* Current Blynk Sensor Status */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SensorCard
            label="Temperature"
            value={status?.temperature ?? null}
            unit="°C"
          />

          <SensorCard
            label="Humidity"
            value={status?.humidity ?? null}
            unit="%"
          />

          <SensorCard label="Light" value={status?.light ?? null} unit="ADC" />

          <SensorCard label="Gas" value={status?.gas ?? null} unit="ADC" />
        </section>

        {/* Chart + Device Status */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Environment History */}
          <div className="rounded-xl border bg-white p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Environment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Temperature and humidity over time
            </p>

            <div className="mt-4">
              {isLoadingHistory ? (
                <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-400">Loading history...</p>
                </div>
              ) : history.length > 0 ? (
                <EnvironmentChart readings={history} />
              ) : (
                <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-400">
                    No historical data available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Device Status */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Device Status
            </h2>

            <div className="mt-4 space-y-4">
              <StatusRow
                label="Door"
                value={
                  status?.door == null
                    ? "--"
                    : status.door === 1
                      ? "Open"
                      : "Closed"
                }
              />

              <StatusRow
                label="Fan"
                value={
                  status?.fan == null ? "--" : status.fan === 1 ? "ON" : "OFF"
                }
              />

              <StatusRow
                label="LED"
                value={
                  status?.led == null ? "--" : status.led === 1 ? "ON" : "OFF"
                }
              />

              <StatusRow
                label="Person"
                value={
                  status?.person == null
                    ? "--"
                    : status.person === 1
                      ? "Detected"
                      : "None"
                }
              />

              <StatusRow
                label="Rain"
                value={
                  status?.rain == null
                    ? "--"
                    : status.rain === 1
                      ? "Detected"
                      : "None"
                }
              />
            </div>
          </div>
        </section>

        <DeviceControl
          roof={status?.roof ?? null}
          fan={status?.fan ?? null}
          led={status?.led ?? null}
        />

        {/* Sensor History Table */}
        <section className="rounded-xl border bg-white p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Sensor History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent sensor readings for the selected device
            </p>
          </div>

          <div className="mt-4">
            <SensorHistoryTable
              readings={readings}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoadingReadings}
            />
          </div>
        </section>
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
