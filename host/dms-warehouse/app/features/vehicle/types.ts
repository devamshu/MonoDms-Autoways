export interface VehicleRef {
  id: number;
  name: string;
}

export interface DmsVehicle {
  id: number;
  vehicle: VehicleRef;
  variant: VehicleRef;
  color: VehicleRef;
  manufacturing_year: string;
}

export type VehicleType = "2W" | "4W";
export type VehicleMode = "petrol" | "diesel" | "ev";

export interface VehicleDispatch {
  id: number;
  dms_vehicle: DmsVehicle;
  vehicle_mode: string;
  type: string;
  chassis_no: string | null;
  frame_no: string | null;
  engine_no: string | null;
  motor_no: string | null;
  battery_no: string | null;
  vehicle_register_no: string | null;
  vehicle_register_date: string | null;
  vehicle_register_date_np: string | null;
  pragyapan_no: string | null;
  pragyapan_date: string | null;
  pragyapan_date_np: string | null;
  key_no: string | null;
  current_location: string | null;
  receiver_stockyard_received_date: string | null;
  sender_stockyard_dispatched_date: string | null;
  receiver_stockyad: string | null;
  order: number | null;
  invoice_no: string | null;
  registration_history: unknown[];
}

export interface VehicleStockItem {
  id: number;
  current_status: string;
  is_damage: boolean;
  dispatch: VehicleDispatch;
  dms_vehicle_id: number;
}

export interface AddVehiclePayload {
  dispatch: number | null;
  vehicle: number | null;
  variant: number | null;
  color: number | null;
  manufacturing_year: string | null;
  vehicle_type: VehicleType | null;
  vehicle_mode: VehicleMode | null;
  frame_no: string | null;
  battery_no: string | null;
  motor_no: string | null;
  chassis_no: string | null;
  engine_no: string | null;
  status: "STOCK";
}

export interface AddVehicleResponse {
  success: boolean;
  message?: string;
  data?: VehicleStockItem;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface VehicleStockInventoryParams {
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

export type VehicleStockInventoryResponse = PaginatedResponse<VehicleStockItem>;
