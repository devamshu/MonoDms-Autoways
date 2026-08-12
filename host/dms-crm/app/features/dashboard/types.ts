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

export interface MonthlyConversionRow {
  id: string;
  month: string;
  leads: number;
  deals: number;
  conversion_rate: number;
}
