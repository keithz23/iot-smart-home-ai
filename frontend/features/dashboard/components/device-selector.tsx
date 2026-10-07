"use client";

import type { Device } from "@/types/device";
import { Select } from "@/components/ui/select";

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
        Thiết bị
      </label>

      <Select
        id="device"
        value={selectedDeviceId ?? ""}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sky-500"
      >
        <option value="" disabled>
          Chọn thiết bị
        </option>

        {devices.map((device) => (
          <option
            key={device.id}
            value={device.id}
            disabled={!device.is_active}
          >
            {device.name} — {device.location ?? "Không rõ vị trí"}
          </option>
        ))}
      </Select>
    </div>
  );
}
