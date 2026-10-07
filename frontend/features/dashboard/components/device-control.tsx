"use client";

import { useEffect, useState } from "react";
import { Home, Lightbulb, Fan } from "lucide-react";

import { controlDevice } from "@/features/dashboard/api";

type ControlDevice = "roof" | "fan" | "led";

interface DeviceControlProps {
  roof: number | null;
  fan: number | null;
  led: number | null;
  onControlSuccess: () => Promise<void>;
  isLoading?: boolean;
}

const controls: {
  device: ControlDevice;
  label: string;
  icon: typeof Home;
}[] = [
  {
    device: "roof",
    label: "Mái che",
    icon: Home,
  },
  {
    device: "fan",
    label: "Quạt DC",
    icon: Fan,
  },
  {
    device: "led",
    label: "Đèn LED",
    icon: Lightbulb,
  },
];

export function DeviceControl({
  roof,
  fan,
  led,
  onControlSuccess,
  isLoading = false,
}: DeviceControlProps) {
  const [values, setValues] = useState<Record<ControlDevice, number>>({
    roof: roof ?? 0,
    fan: fan ?? 0,
    led: led ?? 0,
  });

  const [loadingDevice, setLoadingDevice] = useState<ControlDevice | null>(
    null,
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues({
      roof: roof ?? 0,
      fan: fan ?? 0,
      led: led ?? 0,
    });
  }, [roof, fan, led]);

  async function handleToggle(device: ControlDevice) {
    const currentValue = values[device];
    const nextValue = currentValue === 1 ? 0 : 1;

    try {
      setLoadingDevice(device);
      setError(null);

      await controlDevice(device, nextValue);

      await onControlSuccess();
    } catch {
      setError("Không thể điều khiển thiết bị.");
    } finally {
      setLoadingDevice(null);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Device Control
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Điều khiển các thiết bị trong nhà
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
          Connected
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {controls.map((control) => {
          const isOn = values[control.device] === 1;
          const isControlLoading = loadingDevice === control.device;

          const Icon = control.icon;

          return (
            <div
              key={control.device}
              className={`rounded-xl border p-5 transition ${
                isOn
                  ? "border-sky-200 bg-sky-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isOn
                      ? "bg-sky-100 text-sky-600"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Icon size={21} />
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  disabled={isLoading || isControlLoading}
                  onClick={() => handleToggle(control.device)}
                  aria-label={`Toggle ${control.label}`}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    isOn ? "bg-sky-500" : "bg-slate-300"
                  } ${
                    isLoading || isControlLoading
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      isOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Device info */}
              <div className="mt-5">
                <p className="font-medium text-slate-900">{control.label}</p>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOn ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />

                  <span
                    className={`text-sm ${
                      isOn ? "text-emerald-600" : "text-slate-500"
                    }`}
                  >
                    {isLoading
                      ? "Đang đồng bộ..."
                      : isControlLoading
                        ? "Đang cập nhật..."
                        : isOn
                          ? "Đang bật"
                          : "Đang tắt"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
