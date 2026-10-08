import type { LucideIcon } from "lucide-react";

interface SensorCardProps {
  label: string;
  value: number | null;
  unit: string;
  icon: LucideIcon;
}

export function SensorCard({
  label,
  value,
  unit,
  icon: Icon,
}: SensorCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Icon size={20} />
        </div>

        <span className="text-xs font-medium text-slate-400">LIVE</span>
      </div>

      <div className="mt-5">
        <p className="text-sm text-slate-500">{label}</p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-slate-900">
            {value ?? "--"}
          </span>

          <span className="text-sm text-slate-400">{unit}</span>
        </div>
      </div>
    </div>
  );
}
