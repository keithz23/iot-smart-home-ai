"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SensorReading } from "@/types/sensor";

interface EnvironmentChartProps {
  readings: SensorReading[];
}

export function EnvironmentChart({ readings }: EnvironmentChartProps) {
  const data = readings.map((reading) => ({
    time: new Date(reading.recorded_at).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: reading.temperature,
    humidity: reading.humidity,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="time" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="temperature"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="humidity"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
