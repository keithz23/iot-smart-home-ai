export interface AuditLog {
  id: number;
  user_id: number | null;
  device_id: number | null;
  event_type: string;
  source: "ai" | "user" | "system" | string;
  target: string | null;
  value_before: number | null;
  value_after: number | null;
  request_text: string | null;
  reason: string | null;
  status: "success" | "failed" | "executing" | string;
  confirmed_by_user: boolean;
  error_message: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
