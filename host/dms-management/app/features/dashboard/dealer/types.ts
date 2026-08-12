export interface FiltersApplied {
  fiscal_year: string;
  fiscal_year_id: number;
}

export interface DealerDashboardFilters {
  fiscal_year?: number | string;
  dealer?: number | string;
  brand?: number | string;
}

export interface StatisticValue {
  current: number;
  previous: number;
  change: number;
}

// ---------- Summary (already defined earlier — included for completeness) ----------
export interface DealerFiscalYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export interface DeliveryPerformance {
  delivered_on_time: StatisticValue;
  delivered_late: StatisticValue;
  on_time_percentage: StatisticValue;
}

export interface DealerStatistics {
  total_dealers: StatisticValue;
  total_orders: StatisticValue;
  orders_approved: StatisticValue;
  orders_pending: StatisticValue;
  orders_received: StatisticValue;
  approval_percentage: StatisticValue;
  total_stock: StatisticValue;
  billed_stock: StatisticValue;
  sold_stock: StatisticValue;
  total_grn: StatisticValue;
  delivery_performance: DeliveryPerformance;
}

export interface DealerSummaryBlock {
  total_orders_value: number;
  total_stock_value: number;
  overall_approval_rate: number;
  active_dealers: number;
  on_time_delivery_rate: number;
}

export interface DealerSummaryData {
  fiscal_year: DealerFiscalYear;
  statistics: DealerStatistics;
  summary: DealerSummaryBlock;
  filters_applied: FiltersApplied;
}

export interface DealerSummaryResponse {
  data: DealerSummaryData;
  message: string;
  status: number;
  success: boolean;
}

export interface CustomerStatusData {
  first_customers_count: number;
  repeat_customers_count: number;
  anonymous_inquiries_count: number;
  total_customers: number;
  filters_applied: FiltersApplied;
}

export interface CustomerStatusResponse {
  data: CustomerStatusData;
  message: string;
  status: number;
  success: boolean;
}

export interface StockStatusCount {
  status: string;
  count: number;
}

export interface StockPipelineData {
  total: number;
  by_status: StockStatusCount[];
  filters_applied: FiltersApplied;
}

export interface StockPipelineResponse {
  data: StockPipelineData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Lead Conversion Monthly (assumed CRM-like shape) ----------
export interface DealerMonthlyConversion {
  month: string;
  month_name: string;
  total_inquiries: number;
  converted_count: number;
  conversion_rate: number;
}

export interface LeadConversionSummary {
  total_inquiries: number;
  total_converted: number;
  overall_conversion_rate: number;
}

export interface LeadConversionMonthlyData {
  monthly_data: DealerMonthlyConversion[];
  summary: LeadConversionSummary;
  filters_applied: FiltersApplied;
}

export interface LeadConversionMonthlyResponse {
  data: LeadConversionMonthlyData;
  message: string;
  status: number;
  success: boolean;
}
