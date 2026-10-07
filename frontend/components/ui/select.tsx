import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sky-500",
        className,
      )}
      {...props}
    />
  );
}
