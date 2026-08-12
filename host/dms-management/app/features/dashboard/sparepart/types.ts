// ---------- Shared ----------
export interface FiltersApplied {
  fiscal_year: string;
  fiscal_year_id: number;
}

export interface SparepartDashboardFilters {
  fiscal_year?: number | string;
  dealer?: number | string;
  brand?: number | string;
}

export interface StatisticValue {
  current: number;
  previous: number;
  change: number;
}

// ---------- Summary ----------
export interface SparepartFiscalYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export interface SparepartStatistics {
  total_stock_quantity: StatisticValue;
  total_stock_value: StatisticValue;
  total_purchase_value: StatisticValue;
  pending_backorder_quantity: StatisticValue;
  inventory_turnover_ratio: StatisticValue;
  holding_cost_value: StatisticValue;
}

export interface SparepartSummaryBlock {
  total_stock_quantity: number;
  total_stock_value: number;
  inventory_turnover_ratio: number;
}

export interface SparepartSummaryData {
  fiscal_year: SparepartFiscalYear;
  statistics: SparepartStatistics;
  summary: SparepartSummaryBlock;
  filters_applied: FiltersApplied;
}

export interface SparepartSummaryResponse {
  data: SparepartSummaryData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Order Summary ----------
export interface OrderStat {
  count: number;
  total_value: number;
}

export interface SparepartOrderSummary {
  completed_orders: OrderStat;
  pending_orders: OrderStat;
  canceled_orders: OrderStat;
  total_orders: OrderStat;
}

export interface OrderSummaryData {
  order_summary: SparepartOrderSummary;
  filters_applied: FiltersApplied;
}

export interface OrderSummaryResponse {
  data: OrderSummaryData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Monthly Inventory Turnover ----------
export interface MonthlyTurnover {
  month: string;
  month_name: string;
  inventory_value: number;
  cogs: number;
  turnover_ratio: number;
}

export interface InventoryTurnoverSummary {
  average_turnover_ratio: number;
  max_turnover_ratio: number;
  min_turnover_ratio: number;
  months_analyzed: number;
}

export interface InventoryTurnoverData {
  monthly_turnover: MonthlyTurnover[];
  summary: InventoryTurnoverSummary;
  filters_applied: FiltersApplied;
}

export interface InventoryTurnoverResponse {
  data: InventoryTurnoverData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Order vs Dispatch ----------
export interface MonthlyOrderVsDispatch {
  month: string;
  month_name: string;
  order_quantity: number;
  dispatch_quantity: number;
  fulfillment_rate: number;
  remaining_quantity: number;
}

export interface OrderVsDispatchSummary {
  total_order_quantity: number;
  total_dispatch_quantity: number;
  overall_fulfillment_rate: number;
}

export interface OrderVsDispatchData {
  monthly_order_vs_dispatch: MonthlyOrderVsDispatch[];
  summary: OrderVsDispatchSummary;
  filters_applied: FiltersApplied;
}

export interface OrderVsDispatchResponse {
  data: OrderVsDispatchData;
  message: string;
  status: number;
  success: boolean;
}
