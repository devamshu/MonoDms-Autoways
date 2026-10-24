export interface VehicleRef {
  id: number;
  name: string;
}

export interface VehiclePrice {
  id: number;
  dealer_price: number;
  customer_price: number;
  vehicle: number;
}

export interface DealerDmsVehicle {
  id: number;
  vehicle: VehicleRef;
  variant: VehicleRef;
  color: VehicleRef;
  manufacturing_year: string;
  vehicle_price: VehiclePrice[];
  vehicle_specifications: unknown[];
}

export interface DealerVehicleItem {
  id: number;
  vehicle: number;
  dms_vehicle: DealerDmsVehicle;
  chassis_no: string | null;
  frame_no: string | null;
  engine_no: string | null;
  motor_no: string | null;
  battery_no: string | null;
  vehicle_type: string | null;
  ldv_id: number | null;
  vehicle_register_no: string | null;
  vehicle_register_date: string | null;
  vehicle_register_date_np: string | null;
  registration_history: unknown[];
  current_status: string;
  dealer: number | null;
  stock_date: string | null;
  stocked_by: number | null;
  assigned_to: number | null;
  order: number | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DealerVehicleParams {
  page?: number;
  page_size?: number;
  search?: string;
  vehicle?: string;
  variant?: string;
  color?: string;
  manufacturing_year?: string;
  status?: string;
  ordering?: string;
}

export type DealerVehicleResponse = PaginatedResponse<DealerVehicleItem>;
