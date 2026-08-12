export interface FiltersApplied {
  fiscal_year: string;
  fiscal_year_id: number;
}

export interface CrmDashboardFilters {
  fiscal_year?: number | string;
  dealer?: number | string;
  brand?: number | string;
}

export interface CrmSummary {
  total_leads: number;
  total_leads_pct_change: number | null;
  lead_conversion_rate: number;
  lead_conversion_rate_pct_change: number | null;
  total_deals: number;
  total_deals_pct_change: number | null;
  total_bookings: number;
  total_bookings_pct_change: number | null;
  total_inquiries: number;
  total_inquiries_pct_change: number | null;
  total_revenue: number;
  total_revenue_pct_change: number | null;
}

export interface CrmSummaryResponse {
  data: CrmSummary;
  message: string;
  status: number;
  success: boolean;
}

export interface InquiryStatus {
  status: string;
  count: number;
}

export interface InquiryStatusData {
  inquiry_status_count: InquiryStatus[];
  inquiry_count: number;
  filters_applied: FiltersApplied;
}

export interface InquiryStatusResponse {
  data: InquiryStatusData;
  message: string;
  status: number;
  success: boolean;
}

export interface InquiryKind {
  kind: string;
  count: number;
}

export interface InquiryKindData {
  inquiry_kind_count: InquiryKind[];
  inquiry_count: number;
  filters_applied: FiltersApplied;
}

export interface InquiryKindResponse {
  data: InquiryKindData;
  message: string;
  status: number;
  success: boolean;
}

export interface PaymentMode {
  payment_mode: string;
  count: number;
}

export interface PaymentModeData {
  payment_mode_count: PaymentMode[];
  payment_process_count: number;
  filters_applied: FiltersApplied;
}

export interface PaymentModeResponse {
  data: PaymentModeData;
  message: string;
  status: number;
  success: boolean;
}

export interface MonthlyConversionData {
  months: string[];
  leads: number[];
  deals: number[];
  conversion_rate: number[];
  filters_applied: FiltersApplied;
}

export interface MonthlyConversionResponse {
  data: MonthlyConversionData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Customer / Inquiry (full) ----------
export interface CustomerPhone {
  id: number;
  category: string;
  phone: string;
  country_code: string;
  relation: number;
}

export interface CustomerEmail {
  id: number;
  category: string;
  email: string;
  relation: number;
}

export interface VehicleDetail {
  id: number;
  name: string;
  vehicle_name: string;
  variant_name: string;
  color_name: string;
  manufacturing_year: string;
}

export interface Customer {
  id: number;
  inq_no: string | null;
  inquiry_age: string;
  inquiry_date: string;
  phone: CustomerPhone[];
  customer: number;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  name: string;
  contact: string;
  email: CustomerEmail[];
  address: string;
  address2: string | null;
  city: number | null;
  city_name: string | null;
  country: number | null;
  country_name: string | null;
  zip_code: string | null;
  occupation: number | null;
  occupation_name: string | null;
  gender: string | null;
  vehicle_details: VehicleDetail[];
  deal_vehicle: number | null;
  dealer: number | null;
  inquiry_source: number | null;
  inquiry_source_name: string | null;
  kind: number | null;
  kind_name: string | null;
  is_converted_to_deal: boolean;
  assigned_to: number | null;
  is_followup: boolean;
  followup_status: string | null;
  remarks: string | null;
  existing_vehicle_name: string | null;
  our_vehicle_name: string | null;
  existing_vehicle_count: number | null;
  our_vehicle_count: number | null;
  total_fleet: number | null;
  discount_request: number;
  discount_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type CustomerListResponse = PaginatedResponse<Customer>;

export interface CustomerListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_converted_to_deal?: string;
  is_followup?: string;
  kind?: string;
  dealer?: string;
}
