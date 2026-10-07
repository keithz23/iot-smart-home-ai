export interface Device {
  id: number;
  device_id: string;
  name: string;
  location: string | null;
  is_active: boolean;
  created_at: string;
}
