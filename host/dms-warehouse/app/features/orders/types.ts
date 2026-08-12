export interface SparePartDetails {
  id: number;
  name: string;
  part_code: string;
  alternate_part_code?: string;
  category?: {
    id: number;
    name: string;
  };
  remarks?: string;
}

export interface StockyardDetails {
  id: number;
  name: string;
  prefix: string;
  type: string;
}

export interface OrderItem {
  id: number;
  sparepart: number;
  sparepart_details: SparePartDetails;
  ordered_quantity: number;
  received_quantity: number;
  excess_quantity: number;
  damage_quantity: number;
  short_quantity: number;
  backlog_quantity: number;
  rate: number | null;
  amount: number | null;
  cancel_status: number;
  cancel_reason: string | null;
  received_order_details: any | null;
  dispatch_quantity?: number;
}

export interface PartsOrder {
  id: number;
  order_no: string;
  order_type: string;
  dispatch_mode: string | null;
  order_date: string;
  order_date_np: string;
  status: string;
  stockyard: number;
  stockyard_details: StockyardDetails;
  supplier_stockyard: number | null;
  supplier_stockyard_details: null;
  remarks: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderPart {
  id: number;
  order: number;
  sparepart: {
    id: number;
    name: string;
    part_code: string;
  } | null;
  ordered_quantity: number;
  received_quantity: number;
  dispatch_quantity?: number;
  damage_quantity?: number;
  short_quantity?: number;
  excess_quantity?: number;
}

export interface PartsOrderParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  order_no?: string;
  order_type?: string;
  stockyard__id?: string;
  supplier_stockyard__id?: string;
  ordering?: string;
}

export interface OrderItemPayload {
  sparepart: number;
  ordered_quantity: number;
}

export interface UpdateOrderPayload {
  order_items: OrderItemPayload[];
}

export interface PartsOrderResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PartsOrder[];
}
