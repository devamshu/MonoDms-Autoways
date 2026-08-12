export interface FiltersApplied {
  fiscal_year: string;
  fiscal_year_id: number;
}

export interface BillingRow {
  id: string;
  month: string;
  current_year: number;
  previous_year: number;
}

export interface LogisticDashboardFilters {
  fiscal_year?: number | string;
  dealer?: number | string;
  brand?: number | string;
}

// ---------- Dispatch Summary ----------
export interface DispatchSummaryData {
  pending_dispatched: number;
  transit_dispatched: number;
  stock_dispatched: number;
  filters_applied: FiltersApplied;
}

export interface DispatchSummaryResponse {
  data: DispatchSummaryData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Dispatch Performance Report ----------
export interface DispatchPerformanceRow {
  month: number;
  total_quantity: number;
  avg_hours: number;
}

export interface DispatchPerformanceData {
  results: DispatchPerformanceRow[];
  filters_applied: FiltersApplied;
}

export interface DispatchPerformanceResponse {
  data: DispatchPerformanceData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Retail Billing ----------
export interface RetailBillingRow {
  month: string;
  current_year_billing: number;
  current_year_retail: number;
  previous_year_billing: number;
  previous_year_retail: number;
}

export interface RetailBillingData {
  results: RetailBillingRow[];
  filters_applied: FiltersApplied;
}

export interface RetailBillingResponse {
  data: RetailBillingData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Top Dealer & Vehicle Report ----------
export interface TopDealerRow {
  dealer__id: number;
  dealer__name: string;
  total_quantity: number;
}

export interface TopVehicleRow {
  dms_vehicle__id: number;
  dms_vehicle__vehicle__name: string;
  total_quantity: number;
}

export interface TopDealerVehicleData {
  top_dealers: TopDealerRow[];
  top_vehicles: TopVehicleRow[];
  filters_applied: FiltersApplied;
}

export interface TopDealerVehicleResponse {
  data: TopDealerVehicleData;
  message: string;
  status: number;
  success: boolean;
}