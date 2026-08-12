export interface MasterVehicle {
  id: number;
  name: string;
  brand: string | null;
  firm: number;
  firm_name: string;
  rank: number;
}

export interface MasterBrand {
  id: number;
  name: string;
  prefix: string;
  logo: string | null;
  description: string;
  rank: number;
}

export interface MasterDealer {
  id: number;
  name: string;
  dealer_contact_person: string | null;
  is_deleted: boolean;
  restored_at: string | null;
}

export interface MasterFiscalYear {
  id: number;
  nepali_start_date: string;
  english_start_date: string;
  nepali_end_date: string | null;
  english_end_date: string | null;
  text: string;        // e.g. "FY 2025/2026"
  status: boolean;     
}

export interface MasterFilterOptions {
  dealers: { label: string; value: string }[];
  brands: { label: string; value: string }[];
  vehicles: { label: string; value: string }[];
}
