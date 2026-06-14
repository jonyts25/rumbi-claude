export type OccupancyLevel = "empty" | "medium" | "full";

/** Modo en el que la persona vive la ruta. */
export type RideMode = "waiting" | "riding";

export interface Route {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  created_at?: string;
}

export interface VehiclePosition {
  id?: string;
  route_id: string;
  lat: number;
  lng: number;
  source_id: string;
  created_at?: string;
}

export interface OccupancyReport {
  id?: string;
  route_id: string;
  level: OccupancyLevel;
  source_id: string;
  created_at?: string;
}
