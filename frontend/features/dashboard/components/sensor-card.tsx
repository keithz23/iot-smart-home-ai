interface SensorCardProps {
  label: string;
  value: number | null;
  unit: string;
}

import { Card, CardContent } from "@/components/ui/card";

export function SensorCard({ label, value, unit }: SensorCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
      <p className="text-sm text-slate-500">{label}</p>

      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-semibold text-slate-900">{value ?? "--"}</p>

        <span className="text-sm text-slate-400">{unit}</span>
      </div>
      </CardContent>
    </Card>
  );
}
