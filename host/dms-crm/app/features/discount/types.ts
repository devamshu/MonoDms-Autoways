export interface Discount {
  id: number;
  inquiry: number | null;
  requested_discount_amount: number | null;
  given_discount_amount: number | null;
  status: "pending" | "approved" | "rejected" | string; // Updated from is_approved
  status_display: string; // Display text for status
  policy_name: string | null;
  vehicle_name: string | null;
  discount_designations: any[];
  remarks: string | null;
  created_at: string;
  requested_by: number | null;
  requested_by_name: string | null;
  approved_by_name: string | null;
  rejected_by_name: string | null;
  max_allowed_amount?: number | null; // Optional if not in all responses
  intended_for?: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type DiscountListResponse = PaginatedResponse<Discount>;

export interface DiscountListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_approved?: string;
}

export interface UpdateAmountPayload {
  amount: number;
}

export interface DiscountActionResponse {
  id: number;
  message?: string;
  given_discount_amount?: number | null;
  is_approved?: boolean | null;
}
