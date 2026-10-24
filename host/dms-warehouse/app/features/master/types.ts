export interface MasterVehicle {
  id: number;
  name: string;
  brand: string | null;
  firm: number;
  firm_name: string;
  rank: number;
}

export interface MasterVariant {
  id: number;
  name: string;
  rank: number;
}

export interface MasterColor {
  id: number;
  name: string;
  code: string;
  rank: number;
}

export interface MasterStockyard {
  id: number;
  name: string;
  country: string | null;
  city: string | null;
  zip_code: string | null;
  stockyard_incharge: string | null;
  type: string | null;
  prefix: string | null;
  status: boolean;
  stockyard_phone: any[];
}

export interface MasterLocation {
  id: number;
  area: string | null;
  zone: string | null;
  aisle: string | null;
  location_name: string;
  location_code: string;
  bay: string;
  level: string;
  status: boolean;
  stockyard: number;
}

export interface MasterDealer {
  id: number;
  name: string;
}

export interface MasterFilterOptions {
  vehicles: { label: string; value: string }[];
  variants: { label: string; value: string }[];
  colors: { label: string; value: string }[];
  stockyards: { label: string; value: string }[];
  locations: { label: string; value: string }[];
}
