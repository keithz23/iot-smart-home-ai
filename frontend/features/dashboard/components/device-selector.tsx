"use client";

import type { Device } from "@/types/device";

interface DeviceSelectorProps {
  devices: Device[];
  selectedDeviceId: number | null;
  onChange: (deviceId: number) => void;
}

export function DeviceSelector({
  devices,
  selectedDeviceId,
  onChange,
}: DeviceSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="device" className="text-sm font-medium text-slate-700">
        Device
      </label>

      <select
        id="device"
        value={selectedDeviceId ?? ""}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="rounded-lg border bg-white px-3 py-2 text-sm outline-none"
      >
        <option value="" disabled>
          Select device
        </option>

        {devices.map((device) => (
          <option
            key={device.id}
            value={device.id}
            disabled={!device.is_active}
          >
            {device.name} — {device.location ?? "Unknown location"}
          </option>
        ))}
      </select>
    </div>
  );
}
