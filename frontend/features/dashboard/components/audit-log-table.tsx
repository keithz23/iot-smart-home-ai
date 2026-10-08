import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuditLog } from "@/types/audit-log";
import { formatDateTimeVN } from "@/lib/date";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  ai: "AI",
  user: "Người dùng",
  system: "Hệ thống",
};

const EVENT_LABELS: Record<string, string> = {
  device_action_completed: "Điều khiển thiết bị",
  device_action_failed: "Điều khiển thất bại",
  login_succeeded: "Đăng nhập",
  login_failed: "Đăng nhập thất bại",
  logout: "Đăng xuất",
  sensor_sync_completed: "Đồng bộ cảm biến",
  sensor_sync_failed: "Đồng bộ thất bại",
};

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">Đang tải audit logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">Chưa có audit log</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Sự kiện</TableHead>
            <TableHead>Nguồn</TableHead>
            <TableHead>Đối tượng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap text-xs text-slate-500">
                {formatDateTimeVN(log.created_at)}
              </TableCell>
              <TableCell className="font-medium text-slate-700">
                {EVENT_LABELS[log.event_type] ?? log.event_type}
              </TableCell>
              <TableCell>
                <Badge className="border-slate-200 bg-slate-50 text-slate-600">
                  {SOURCE_LABELS[log.source] ?? log.source}
                </Badge>
              </TableCell>
              <TableCell>
                {log.target ? (
                  <span className="capitalize">{log.target}</span>
                ) : (
                  "--"
                )}
                {log.value_after !== null && (
                  <span className="ml-2 text-xs text-slate-400">
                    {log.value_after}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    log.status === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : log.status === "failed"
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                  }
                >
                  {log.status === "success"
                    ? "Thành công"
                    : log.status === "failed"
                      ? "Thất bại"
                      : log.status}
                </Badge>
              </TableCell>
              <TableCell
                className="max-w-xs truncate text-xs text-slate-500"
                title={log.error_message ?? log.reason ?? undefined}
              >
                {log.error_message ?? log.reason ?? "--"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
