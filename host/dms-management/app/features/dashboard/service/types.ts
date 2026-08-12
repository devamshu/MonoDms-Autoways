export interface FiltersApplied {
  fiscal_year: string;
  fiscal_year_id: number;
}

export interface ServiceDashboardFilters {
  fiscal_year?: number | string;
  dealer?: number | string;
  brand?: number | string;
}

// ---------- Summary ----------
export interface ServiceSummaryData {
  total_followups: number;
  total_connected: number;
  total_satisfied: number;
  overall_csat: number;
  total_resolved: number;
  total_unresolved: number;
  total_cases: number;
  overall_resolution: number;
  filters_applied: FiltersApplied;
}

export interface ServiceSummaryResponse {
  data: ServiceSummaryData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Top Flow Achievers ----------
export interface FlowAchiever {
  dealer_id: number;
  dealer_name: string;
  actual_flow: number;
  target_flow: number;
  achievement_percentage: number;
  gap: number;
  status: string;
}

export interface FlowAchieversSummary {
  total_actual_flow: number;
  total_target_flow: number;
  overall_achievement_percentage: number;
  limit: number;
  total_dealers: number;
}

export interface TopFlowAchieversData {
  top_achievers: FlowAchiever[];
  summary: FlowAchieversSummary;
  filters_applied: FiltersApplied;
}

export interface TopFlowAchieversResponse {
  data: TopFlowAchieversData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Top CSAT Achievers ----------
export interface CsatAchiever {
  dealer_id: number;
  dealer_name: string;
  total_connected: number;
  total_satisfied: number;
  csat_score: number;
  total_responses: number;
  rank: number;
}

export interface CsatAchieversSummary {
  total_connected: number;
  total_satisfied: number;
  average_csat: number;
  limit: number;
  total_dealers: number;
}

export interface TopCsatAchieversData {
  top_achievers: CsatAchiever[];
  summary: CsatAchieversSummary;
  filters_applied: FiltersApplied;
}

export interface TopCsatAchieversResponse {
  data: TopCsatAchieversData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Top Revenue Achievers ----------
export interface RevenueBreakdown {
  jobcard_revenue: number;
  parts_revenue: number;
  outside_work_cost: number;
}

export interface RevenueAchiever {
  dealer_id: number;
  dealer_name: string;
  revenue_breakdown: RevenueBreakdown;
  total_revenue: number;
  target_revenue: number;
  achievement_percentage: number;
  gap: number;
  status: string;
  rank: number;
}

export interface RevenueAchieversSummary {
  total_actual_revenue: number;
  total_target_revenue: number;
  average_achievement_percentage: number;
  limit: number;
  total_dealers: number;
}

export interface TopRevenueAchieversData {
  top_achievers: RevenueAchiever[];
  summary: RevenueAchieversSummary;
  filters_applied: FiltersApplied;
}

export interface TopRevenueAchieversResponse {
  data: TopRevenueAchieversData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Post-Service Followup ----------
export interface FollowupDealer {
  dealer_id?: number;
  dealer_name?: string;
  total_followups?: number;
  total_connected?: number;
  total_failed?: number;
  success_rate?: number;
}

export interface FollowupSummary {
  total_followups: number;
  total_connected: number;
  total_failed: number;
  average_success_rate: number;
  limit: number;
  total_dealers_analyzed: number;
}

export interface PostServiceFollowupData {
  top_dealers: FollowupDealer[];
  summary: FollowupSummary;
  filters_applied: FiltersApplied;
}

export interface PostServiceFollowupResponse {
  data: PostServiceFollowupData;
  message: string;
  status: number;
  success: boolean;
}

// ---------- Customer Satisfaction Status ----------
export interface SatisfactionDealer {
  dealer_id?: number;
  dealer_name?: string;
  total_connected_calls?: number;
  total_satisfied?: number;
  total_unsatisfied?: number;
  csat_score?: number;
}

export interface SatisfactionSummary {
  total_connected_calls: number;
  total_satisfied: number;
  total_unsatisfied: number;
  average_csat_score: number;
  limit: number;
  total_dealers_analyzed: number;
}

export interface CustomerSatisfactionData {
  top_dealers: SatisfactionDealer[];
  summary: SatisfactionSummary;
  filters_applied: FiltersApplied;
}

export interface CustomerSatisfactionResponse {
  data: CustomerSatisfactionData;
  message: string;
  status: number;
  success: boolean;
}
