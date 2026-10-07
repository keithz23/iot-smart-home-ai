"use client";

import type { SensorReading } from "@/types/sensor";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <p className="text-sm text-slate-400">Đang tải dữ liệu cảm biến...</p>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50">
        <p className="text-sm text-slate-400">Chưa có lịch sử cảm biến</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead><TableHead>Nhiệt độ</TableHead>
              <TableHead>Độ ẩm</TableHead><TableHead>Ánh sáng</TableHead>
              <TableHead>Khí gas</TableHead><TableHead>Cửa</TableHead>
              <TableHead>Con người</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readings.map((reading) => (
              <TableRow key={reading.id}>
                <TableCell className="whitespace-nowrap text-slate-500">
                  {new Date(reading.recorded_at).toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="font-medium">
                  {reading.temperature ?? "--"} °C
                </TableCell>
                <TableCell>{reading.humidity ?? "--"} %</TableCell>
                <TableCell>{reading.light ?? "--"}</TableCell>
                <TableCell>{reading.gas ?? "--"}</TableCell>
                <TableCell>
                  {reading.door == null
                    ? "--"
                    : reading.door === 1
                      ? "Mở"
                      : "Đóng"}
                </TableCell>
                <TableCell>
                  {reading.person == null
                    ? "--"
                    : reading.person === 1
                      ? "Phát hiện"
                      : "Không có"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <p className="text-sm text-slate-500">
          Trang {currentPage} / {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >Trước</Button>

          <Button
            variant="outline"
            disabled={currentPage === totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >Sau</Button>
        </div>
      </div>
    </>
  );
}
