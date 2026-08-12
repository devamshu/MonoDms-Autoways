export interface Category {
  id: number;
  name: string;
  code: string;
}

export interface Stockyard {
  id: number;
  name: string;
  code: string;
  type: string | null;
  status: boolean;
}

export interface Location {
  id: number;
  name: string;
  code: string;
  bay: string | null;
  level: string | null;
  area: string | null;
  zone: string | null;
  aisle: string | null;
}

export interface SparePart {
  id: number;
  name: string;
  part_code: string;
  alternate_part_code: string | null;
  latest_part_code: string | null;
  price: number;
  dealer_price: number;
  uom: string | null;
  category: Category;
  remarks: string | null;
}

export interface PartsInventoryItem {
  id: number;
  sparepart: SparePart;
  quantity: number;
  price: number;
  dealer_price: number;
  stockyard: Stockyard;
  location: Location | null;
}

export interface PartsInventoryParams {
  page?: number;
  page_size?: number;
  search?: string;
  part_code?: string;
  name?: string;
  category?: string;
  stockyard__id?: string;
  location__id?: string;
  ordering?: string;
}

export interface PartsInventoryResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PartsInventoryItem[];
}

export interface AddPartInventoryLogPayload {
  part_code: string;
  name: string;
  quantity: number;
  stockyard: number;
}

export interface PartsInventoryLogItem {
  id?: number;
  part_code: string;
  name: string;
  quantity: number;
  stockyard: number;
}

export interface PartsInventoryLogEnvelope {
  success: boolean;
  message: string;
  status: number;
  data: PartsInventoryLogItem;
}
