export interface PartsDashboardResponse {
  summary: {
    total_stock_quantity: number;
    total_stock_value: number;
  };
  filters_applied: {
    fiscal_year: string;
    fiscal_year_id: number;
  };
}

// For Orders API (/dashboard/sparepart/order-summary/)
export interface OrdersDashboardResponse {
  order_summary: {
    total_orders: {
      count: number;
      total_value: number;
    };
  };
  filters_applied: {
    fiscal_year: string;
    fiscal_year_id: number;
  };
}

export interface DashboardParams {
  fiscal_year_id?: number;
}
