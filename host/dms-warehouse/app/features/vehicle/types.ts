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

export interface DmsVehicle {
  id: number;
  vehicle: VehicleRef;
  variant: VehicleRef;
  color: VehicleRef;
  manufacturing_year: string;
  vehicle_price: VehiclePrice[];
}

export interface StockyardRef {
  id: number;
  name: string;
}

export type VehicleType = "2W" | "4W";
export type VehicleMode = "petrol" | "diesel" | "ev";

export interface VehicleStockItem {
  id: number;
  dms_vehicle: DmsVehicle;
  vehicle: VehicleRef;
  variant: VehicleRef;
  color: VehicleRef;
  manufacturing_year: string;
  vehicle_type: VehicleType;
  vehicle_mode: VehicleMode;
  frame_no: string | null;
  battery_no: string | null;
  motor_no: string | null;
  foc_no: string | null;
  ecu_no: string | null;
  bms_no: string | null;
  power: string | null;
  engine_no: string | null;
  chassis_no: string | null;
  cc: string | null;
  vehicle_register_no: string | null;
  vehicle_register_date: string | null;
  pragyapan_no: string | null;
  pragyapan_date: string | null;
  pragyapan_date_np: string | null;
  key_no: string | null;
  model_code: string | null;
  lc_number: string | null;
  fob_price: number | null;
  receiver_stockyard_received_date: string | null;
  receiver_stockyard_received_date_np: string | null;
  receiver_stockyad: StockyardRef | null;
  barcode: string | null;
  current_location: string | null;
  status: string;
  status_display: string;
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
