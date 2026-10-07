export interface SensorReading {
  id: number;
  device_id: number;

  temperature: number | null;
  humidity: number | null;
  door: number | null;
  light: number | null;
  rain: number | null;
  gas: number | null;
  person: number | null;
  vibration: number | null;
  rfid: string | null;
  roof: number | null;
  fan: number | null;
  led: number | null;

  recorded_at: string;
}

export interface SensorReadingListResponse {
  items: SensorReading[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface BlynkStatus {
  temperature: number | null;
  humidity: number | null;
  door: number | null;
  light: number | null;
  rain: number | null;
  gas: number | null;
  person: number | null;
  vibration: number | null;
  rfid: string | null;
  roof: number | null;
  fan: number | null;
  led: number | null;
}
