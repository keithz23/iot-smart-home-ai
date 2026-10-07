"use client";

import type { SensorReading } from "@/types/sensor";

interface SensorHistoryTableProps {
  readings: SensorReading[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function SensorHistoryTable({
  readings,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: SensorHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">Loading sensor readings...</p>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">No sensor history available</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="whitespace-nowrap px-4 py-3 font-medium">Time</th>

              <th className="px-4 py-3 font-medium">Temperature</th>

              <th className="px-4 py-3 font-medium">Humidity</th>

              <th className="px-4 py-3 font-medium">Light</th>

              <th className="px-4 py-3 font-medium">Gas</th>

              <th className="px-4 py-3 font-medium">Door</th>

              <th className="px-4 py-3 font-medium">Person</th>
            </tr>
          </thead>

          <tbody>
            {readings.map((reading) => (
              <tr key={reading.id} className="border-b last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(reading.recorded_at).toLocaleString()}
                </td>

                <td className="px-4 py-3 font-medium">
                  {reading.temperature ?? "--"} °C
                </td>

                <td className="px-4 py-3">{reading.humidity ?? "--"} %</td>

                <td className="px-4 py-3">{reading.light ?? "--"}</td>

                <td className="px-4 py-3">{reading.gas ?? "--"}</td>

                <td className="px-4 py-3">
                  {reading.door == null
                    ? "--"
                    : reading.door === 1
                      ? "Open"
                      : "Closed"}
                </td>

                <td className="px-4 py-3">
                  {reading.person == null
                    ? "--"
                    : reading.person === 1
                      ? "Detected"
                      : "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <p className="text-sm text-slate-500">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={currentPage === totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
