// types/ccd.ts

export interface CCDModule {
  id: number;
  name: string;
  module_type: string;
  created_by: number | null;
  created_date: string | null;
}

export interface CCDPhone {
  id: number;
  full_name: string | null;
  category: string;
  phone: string;
  country_code: string;
  email: string | null;
  employee: number | null;
  customer: number | null;
  lead: number;
  relation: number;
}

export interface AddInquiryFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
  moduleId?: number;
  preSelectedInquiryId?: number;
  salesId?: number;
  jobcardId?: number;
}

export interface CCDEmail {
  id: number;
  full_name: string | null;
  category: string;
  email: string;
  employee: number | null;
  customer: number | null;
  lead: number;
  relation: number;
}

// Dynamic customer type that can handle any fields
export interface CCDCustomer {
  id: number;
  [key: string]: any; // Allow dynamic fields
  // Common fields
  inquiry_id?: number;
  inq_no?: string | null;
  name?: string;
  contact?: string;
  inquiry_source_name?: string;
  dealer_name?: string;
  phone?: CCDPhone[];
  email?: CCDEmail[];
  created_date?: string;
  // PSF specific fields
  jobcard_id?: number;
  card_no?: string;
  vehicle_no?: string;
  vehicle?: number | null;
  party_name?: {
    id: number;
    full_name: string;
    address: string;
  };
  closed_date?: string;
  created_at?: string;
}

export interface CCDModuleSettings {
  module_id: number;
  module_name: string;
  module_type: string;
  display_fields: Array<{
    name: string;
    label: string;
    type: string;
  }>;
  available_filters: Array<any>;
  table_columns: Array<{
    field: string;
    header: string;
    sortable: boolean;
    type?: string;
  }>;
  metadata: {
    primary_key: string;
    display_key: string;
    search_fields: string[];
    default_sort: string;
  };
  response_config: {
    allow_multiple_responses: boolean;
    require_answers: boolean;
    auto_calculate_satisfaction: boolean;
  };
}

export interface CCDModuleResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    settings: CCDModuleSettings;
    results: CCDCustomer[];
  };
}

export interface CCDListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface CCDModuleField {
  id: number;
  label: string;
  name: string;
  field_type: string;
  options: {
    choices?: string[];
  };
  is_required?: boolean;
  placeholder?: string;
  order?: number;
}

export interface CCDModuleFieldsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CCDModuleField[];
}

// ============ CCD Response Types ============

export interface CCDAnswer {
  id: number;
  field: number;
  value: string;
  field_name: string;
  field_label: string;
}

export interface CCDResponse {
  id: number;
  module: number;
  answers: CCDAnswer[];
  inquiry: number;
  sales: number | null;
  jobcard: number | null;
  is_satisfied: boolean;
  voc: string | null;
  call_status: string;
  created_at: string;
  created_by_name: string | null;
  inquiry_type?: string;
  false_inquiry_type?: string;
}

export interface CCDResponsePayload {
  module: number;
  inquiry?: number;
  sales?: number;
  jobcard?: number;
  answers: Array<{
    field: number;
    value: string;
  }>;
  is_satisfied: boolean;
  call_status: "Connected" | "Not Connected";
  inquiry_type: "Actual Enquiry" | "False Enquiry";
  false_inquiry_type?:
    | "Never Done Enquiry"
    | "Not The Concerned Person"
    | "Other";
}

export interface CCDResponseDetail {
  id: number;
  module: number;
  inquiry?: number;
  sales?: number;
  jobcard?: number;
  answers: Array<{
    field: number;
    value: string;
  }>;
  is_satisfied: boolean;
  call_status: string;
  inquiry_type: string;
  false_inquiry_type?: string;
  created_at: string;
  updated_at: string;
}

export interface CCDResponseListParams {
  page?: number;
  page_size?: number;
  module_id?: number;
  inquiry_id?: number;
  sales_id?: number;
  jobcard_id?: number;
}

// ============ CCD Summary Types ============

export interface CCDSummary {
  total_responses: number;
  satisfied_count: number;
  unsatisfied_count: number;
  satisfaction_rate: number;
  last_contacted: string | null;
  last_call_status: string | null;
}

// ============ Contact Details Types ============

export interface ContactPhone {
  id: number;
  full_name: string | null;
  category: string;
  phone: string;
  country_code: string;
  email: string | null;
  employee: number | null;
  customer: number | null;
  lead: number;
  relation: number;
}

export interface ContactEmail {
  id: number;
  full_name: string | null;
  category: string;
  email: string;
  employee: number | null;
  customer: number | null;
  lead: number;
  relation: number;
}

export interface ContactDetail {
  primary_contact: string;
  primary_email: string;
  phones: ContactPhone[];
  emails: ContactEmail[];
}

// ============ Assigned To Info Types ============

export interface AssignedToInfo {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  personal_email: string;
  dealer_name: string;
  username?: string;
  gender?: string;
  address1?: string;
  address2?: string;
  zip_code?: string;
  country_name?: string;
  city_name?: string;
}

// ============ Customer Info Types ============

export interface CustomerInfo {
  type: string;
  id: number | null;
  full_name: string;
  address: string;
  city: string | null;
  country: string | null;
  gender: string | null;
}

// ============ Inquiry Detail Type ============

export interface InquiryDetail {
  id: number;
  inq_no: string | null;
  inquiry_age: string;
  inquiry_date: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  address2: string | null;
  city: number | null;
  city_name: string | null;
  country: number | null;
  country_name: string | null;
  zip_code: string | null;
  gender: string | null;
  inquiry_source_name: string | null;
  dealer_name: string | null;
  assigned_to: number | null;
  assigned_to_info?: AssignedToInfo;
  occupation_name: string | null;
  kind: number | null;
  kind_name: string | null;
  followup_status: string | null;
  is_followup: boolean;
  customer_info: CustomerInfo;
  contact_details: ContactDetail;
  interested_vehicles: any[];
  deal_vehicle_info: any | null;
  discount_request: number;
  discount_approved: boolean;
  followups: any[];
  test_drives: any[];
  quotations: any[];
  discount_requests: any[];
  notes: any[];
  ccd_responses: CCDResponse[];
  ccd_summary: CCDSummary;
  created_at: string;
  updated_at: string;
  remarks: string | null;
}

// ============ Sales / Retail Detail Type ============

export interface SalesPersonInfo {
  id: number;
  is_deleted: boolean;
  restored_at: string | null;
  transaction_id: string | null;
  has_login: boolean;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  mobile: string;
  personal_email: string;
  gender: string | null;
  address1: string;
  address2: string;
  zip_code: string;
  fiscal_year: number | null;
  designation: number | null;
  dealer: number | null;
  stockyard: number | null;
  country: number | null;
  city: number | null;
  dealer_name: string | null;
  stockyard_name: string | null;
  country_name: string | null;
  city_name: string | null;
  created_at: string;
  updated_at: string;
  rank: number | null;
  username: string;
  emails: Array<{ id: number; email: string; category: string }>;
  phones: any[];
  groups: number[];
}

export interface SalesDetail {
  id: number;
  sales_date: string;
  sales_date_np: string | null;
  customer_info: CustomerInfo | null;
  contact_details: ContactDetail | Record<string, never>;
  sales_person_info: SalesPersonInfo | null;
  dealer_name: string | null;
  inquiry_details: any | null;
  vehicle_details: { stock_id?: number } | null;
  actual_price: number | null;
  discount_amount: number | null;
  sold_price: number | null;
  invoice: any | null;
  accessories: any[];
  ccd_responses: CCDResponse[];
  ccd_summary: CCDSummary;
  created_at: string;
  updated_at: string;
}

export interface SalesDetailResponse {
  data: SalesDetail;
  message: string;
  status: number;
  success: boolean;
}

// ============ PSF / Job Card Detail Type ============

export type JobCardStatus = "Open" | "Pending" | "Complete";
export type JobCardPriority = "Low" | "Normal" | "High";
export type JobCardSourceType = "Walkin" | "Booking";
export type JobCardVehicleType = "Petrol" | "Diesel" | "Electric" | "Hybrid";

export interface JobCardCustomerInfo {
  id: number;
  full_name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  dob: string | null;
  pan_no: string | null;
}

export interface JobCardVehicleInfo {
  vehicle_no: string | null;
  vin_no: string | null;
  chassis_no: string | null;
  engine_no: string | null;
  battery_no: string | null;
  gear_box_no: string | null;
  key_no: string | null;
  kms: number | null;
  fuel_type: string | null;
  service_count: number | null;
  vehicle: { id: number; name: string; brand: string | null } | null;
  variant: { id: number; name: string } | null;
  color: { id: number; name: string } | null;
  model_year: string | null;
}

// Service adviser, mechanic, floor supervisor, and cleaner all share this shape.
export interface JobCardStaffInfo {
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  mobile: string | null;
  personal_email: string | null;
  gender: string | null;
  dealer_name: string | null;
  stockyard_name: string | null;
  country_name: string | null;
  city_name: string | null;
  username: string;
  has_login: boolean;
  emails: Array<{ id: number; email: string; category: string }>;
  phones: Array<{
    id: number;
    phone: string;
    country_code: string;
    category: string;
  }>;
}

export interface JobCardJob {
  id: number;
  customer_voice: string;
  description: string;
  job_price: number;
  job_discount: number;
  job_total: number | null;
  status: string;
  fiscal_year: number | null;
  job_card: number;
  job: number;
  is_deleted: boolean;
}

export interface JobCardPart {
  id: number;
  part_name: string;
  quantity: number;
  issued_date: string | null;
  dispatch_quantity: number;
  received_quantity: number;
  return_quantity: number;
  discount: number;
  total: number;
  job_card: number;
  part_code: number;
  issued_by: number | null;
  is_deleted: boolean;
}

export interface JobCardOutsideWork {
  id: number;
  job: number;
  job_card: number;
  invoice_number: string | null;
  invoice_date: string | null;
  send_date: string | null;
  workshop: string | null;
  prefix: string | null;
  amount: number;
  tax: number;
  discount: number;
  total: number;
  mechanic: number;
  description: string | null;
  remarks: string | null;
}

export interface JobCardBeforeImage {
  id: number;
  image: string;
  job_card: number;
}

export interface JobCardDetail {
  id: number;
  card_no: string;
  created_at: string;
  closed_date: string | null;
  billed_date: string | null;
  booked_date: string | null;
  status: JobCardStatus | string | null;
  priority: JobCardPriority | string;
  is_verified: boolean;
  is_closed: boolean;
  dealer_name: string | null;
  stockyard_name: string | null;
  customer_info: JobCardCustomerInfo;
  contact_details: ContactDetail | { phones: any[]; emails: any[] };
  vehicle_info: JobCardVehicleInfo;
  service_type_name: string | null;
  source_type: JobCardSourceType | string;
  vehicle_type: JobCardVehicleType | string;
  service_adviser_info: JobCardStaffInfo | null;
  mechanic_info: JobCardStaffInfo | null;
  floor_supervisor_info: JobCardStaffInfo | null;
  cleaner_info: JobCardStaffInfo | null;
  customer_voice: string | null;
  advisor_voice: string | null;
  floor_supervisor_voice: string | null;
  description: string | null;
  material_required: string | null;
  accessories: string | null;
  remarks: string | null;
  jobs: JobCardJob[];
  parts: JobCardPart[];
  outside_work: JobCardOutsideWork[];
  before_images: JobCardBeforeImage[];
  quotations: any[];
  cost: number | null;
  paid: number | null;
  discount_amount: number;
  discount_percentage: number;
  net_amount: number | null;
  ccd_responses: CCDResponse[];
  ccd_summary: CCDSummary;
  updated_at: string;
}

export interface JobCardDetailResponse {
  data: JobCardDetail;
  message: string;
  status: number;
  success: boolean;
}

export type CCDModulesListResponse = CCDModule[];
