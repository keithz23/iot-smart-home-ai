import {
  Activity,
  ClipboardList,
  Gauge,
  History,
  LogOut,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardTab = "overview" | "history" | "audit";

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLogout: () => Promise<void>;
}

const navigation: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  icon: typeof Gauge;
}> = [
  {
    id: "overview",
    label: "Tổng quan",
    description: "Cảm biến và điều khiển",
    icon: Gauge,
  },
  {
    id: "history",
    label: "Lịch sử cảm biến",
    description: "Biểu đồ và bản ghi",
    icon: History,
  },
  {
    id: "audit",
    label: "Audit logs",
    description: "Hoạt động hệ thống",
    icon: ClipboardList,
  },
];

export function DashboardSidebar({
  activeTab,
  onTabChange,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside className="h-fit rounded-2xl border bg-white p-3 shadow-sm lg:sticky lg:top-6">
      <div className="mb-4 flex items-center gap-3 px-3 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
          <Activity size={20} />
        </div>
        <div>
          <p className="font-semibold text-slate-900">Smart Home</p>
          <p className="text-xs text-slate-500">AI Control Center</p>
        </div>
      </div>

      <nav className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1" aria-label="Dashboard">
        {navigation.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
              activeTab === id
                ? "bg-sky-50 text-sky-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Icon size={18} />
            <span>
              <span className="block text-sm font-medium">{label}</span>
              <span className="hidden text-xs text-slate-400 lg:block">
                {description}
              </span>
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-4 border-t pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
        <div className="mt-1 hidden items-center gap-3 px-3 py-2 text-xs text-slate-400 lg:flex">
          <Settings size={15} />
          Hệ thống đang online
        </div>
      </div>
    </aside>
  );
}
