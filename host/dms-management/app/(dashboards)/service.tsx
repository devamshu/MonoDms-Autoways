import { StatsCard } from "@/components/custom/dashboard/statsCard";
import { useFilters } from "@/components/custom/filter/filterContext";
import { TableMain } from "@/components/custom/table/main";
import { Column, FetchParams } from "@/components/custom/table/types";
import {
    CheckCircle,
    Link2,
    PhoneCall,
    Smile,
    Star,
    XCircle,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Spinner, Text, useTheme, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import {
    fetchCsatAchievers,
    fetchCustomerSatisfaction,
    fetchFlowAchievers,
    fetchPostServiceFollowup,
    fetchRevenueAchievers,
    fetchServiceSummary,
} from "../features/dashboard/service/store/service.thunks";

// Small reusable hook for client-side paging of an in-memory list
function usePaging() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const onFetch = useCallback(async (params: FetchParams) => {
    setPage(params.page);
    setLimit(params.limit);
  }, []);
  const slice = <T,>(rows: T[]) => rows.slice((page - 1) * limit, page * limit);
  return { page, limit, onFetch, slice };
}

export default function ServiceDashboard() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { activeFilters } = useFilters();

  const {
    summary,
    summaryLoading,
    flowAchievers,
    flowAchieversLoading,
    csatAchievers,
    csatAchieversLoading,
    revenueAchievers,
    revenueAchieversLoading,
    postServiceFollowup,
    postServiceFollowupLoading,
    customerSatisfaction,
    customerSatisfactionLoading,
  } = useAppSelector((state) => state.managementService);

  const flowPaging = usePaging();
  const csatPaging = usePaging();
  const revenuePaging = usePaging();
  const followupPaging = usePaging();
  const satisfactionPaging = usePaging();

  useEffect(() => {
    dispatch(fetchServiceSummary(activeFilters));
    dispatch(fetchFlowAchievers(activeFilters));
    dispatch(fetchCsatAchievers(activeFilters));
    dispatch(fetchRevenueAchievers(activeFilters));
    dispatch(fetchPostServiceFollowup(activeFilters));
    dispatch(fetchCustomerSatisfaction(activeFilters));
  }, [dispatch, activeFilters]);

  const getTrend = (pct: number) => ({
    type: pct >= 0 ? ("increase" as const) : ("decrease" as const),
    percentage: Math.abs(pct),
    comparisonText: "vs last month",
  });

  // ---------- Rows ----------
  const flowRows = useMemo(
    () =>
      (flowAchievers?.top_achievers ?? []).map((d, i) => ({
        id: String(d.dealer_id ?? i),
        rank: i + 1,
        dealer_name: d.dealer_name,
        actual_flow: d.actual_flow,
        target_flow: d.target_flow,
        achievement_percentage: d.achievement_percentage,
      })),
    [flowAchievers],
  );

  const csatRows = useMemo(
    () =>
      (csatAchievers?.top_achievers ?? []).map((d) => ({
        id: String(d.dealer_id),
        rank: d.rank,
        dealer_name: d.dealer_name,
        csat_score: d.csat_score,
        total_responses: d.total_responses,
      })),
    [csatAchievers],
  );

  const revenueRows = useMemo(
    () =>
      (revenueAchievers?.top_achievers ?? []).map((d) => ({
        id: String(d.dealer_id),
        rank: d.rank,
        dealer_name: d.dealer_name,
        total_revenue: d.total_revenue,
        target_revenue: d.target_revenue,
        achievement_percentage: d.achievement_percentage,
      })),
    [revenueAchievers],
  );

  const followupRows = useMemo(
    () =>
      (postServiceFollowup?.top_dealers ?? []).map((d, i) => ({
        id: String(d.dealer_id ?? i),
        rank: i + 1,
        dealer_name: d.dealer_name ?? "—",
        total_followups: d.total_followups ?? 0,
        total_connected: d.total_connected ?? 0,
        success_rate: d.success_rate ?? 0,
      })),
    [postServiceFollowup],
  );

  const satisfactionRows = useMemo(
    () =>
      (customerSatisfaction?.top_dealers ?? []).map((d, i) => ({
        id: String(d.dealer_id ?? i),
        rank: i + 1,
        dealer_name: d.dealer_name ?? "—",
        total_connected_calls: d.total_connected_calls ?? 0,
        total_satisfied: d.total_satisfied ?? 0,
        csat_score: d.csat_score ?? 0,
      })),
    [customerSatisfaction],
  );

  // ---------- Columns ----------
  const rankCol: Column = {
    id: "rank",
    label: "Rank",
    accessor: "rank",
    width: 60,
    align: "center",
  };
  const dealerCol: Column = {
    id: "dealer_name",
    label: "Dealer Name",
    accessor: "dealer_name",
    sortable: true,
    width: 150,
  };
  const pctRender = (value: number) => (
    <Text numberOfLines={1} color="$color">
      {value}%
    </Text>
  );

  const flowColumns: Column[] = [
    rankCol,
    dealerCol,
    {
      id: "actual_flow",
      label: "Actual",
      accessor: "actual_flow",
      align: "center",
      width: 90,
    },
    {
      id: "target_flow",
      label: "Target",
      accessor: "target_flow",
      align: "center",
      width: 90,
    },
    {
      id: "achievement_percentage",
      label: "Achieved %",
      accessor: "achievement_percentage",
      align: "center",
      width: 110,
      render: pctRender,
    },
  ];

  const csatColumns: Column[] = [
    rankCol,
    dealerCol,
    {
      id: "csat_score",
      label: "CSAT Score",
      accessor: "csat_score",
      align: "center",
      width: 110,
    },
    {
      id: "total_responses",
      label: "Responses",
      accessor: "total_responses",
      align: "center",
      width: 100,
    },
  ];

  const revenueColumns: Column[] = [
    rankCol,
    dealerCol,
    {
      id: "total_revenue",
      label: "Revenue (NPR)",
      accessor: "total_revenue",
      align: "center",
      width: 130,
    },
    {
      id: "target_revenue",
      label: "Target (NPR)",
      accessor: "target_revenue",
      align: "center",
      width: 120,
    },
    {
      id: "achievement_percentage",
      label: "Achieved %",
      accessor: "achievement_percentage",
      align: "center",
      width: 110,
      render: pctRender,
    },
  ];

  const followupColumns: Column[] = [
    rankCol,
    dealerCol,
    {
      id: "total_followups",
      label: "Follow-ups",
      accessor: "total_followups",
      align: "center",
      width: 100,
    },
    {
      id: "total_connected",
      label: "Connected",
      accessor: "total_connected",
      align: "center",
      width: 100,
    },
    {
      id: "success_rate",
      label: "Success %",
      accessor: "success_rate",
      align: "center",
      width: 100,
      render: pctRender,
    },
  ];

  const satisfactionColumns: Column[] = [
    rankCol,
    dealerCol,
    {
      id: "total_connected_calls",
      label: "Connected",
      accessor: "total_connected_calls",
      align: "center",
      width: 100,
    },
    {
      id: "total_satisfied",
      label: "Satisfied",
      accessor: "total_satisfied",
      align: "center",
      width: 100,
    },
    {
      id: "csat_score",
      label: "CSAT",
      accessor: "csat_score",
      align: "center",
      width: 90,
      render: pctRender,
    },
  ];

  if (summaryLoading && !summary) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$background"
      >
        <Spinner size="large" color="$primary" />
        <Text marginTop="$3" color="$color10">
          Loading dashboard...
        </Text>
      </YStack>
    );
  }

  // ---------- Summary stat cards ----------
  const STATS = [
    {
      title: "Total Follow-ups",
      value: summary?.total_followups ?? 0,
      icon: PhoneCall,
      fg: theme?.statIconIndigo?.val,
      bg: theme?.statIconBackgroundIndigo?.val,
    },
    {
      title: "Total Connected",
      value: summary?.total_connected ?? 0,
      icon: Link2,
      fg: theme?.statIconEmerald?.val,
      bg: theme?.statIconBackgroundEmerald?.val,
    },
    {
      title: "Total Satisfied",
      value: summary?.total_satisfied ?? 0,
      icon: Smile,
      fg: theme?.statIconAmber?.val,
      bg: theme?.statIconBackgroundAmber?.val,
    },
    {
      title: "Overall CSAT",
      value: summary?.overall_csat ?? 0,
      suffix: "%",
      icon: Star,
      fg: theme?.ongoing?.val,
      bg: theme?.ongoingBackground?.val,
    },
    {
      title: "Total Resolved",
      value: summary?.total_resolved ?? 0,
      icon: CheckCircle,
      fg: theme?.success?.val,
      bg: theme?.successBackground?.val,
    },
    {
      title: "Overall Resolution",
      value: summary?.overall_resolution ?? 0,
      suffix: "%",
      icon: XCircle,
      fg: theme?.pending?.val,
      bg: theme?.pendingBackground?.val,
    },
  ];

  const SectionTitle = ({ children }: { children: string }) => (
    <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
      {children}
    </Text>
  );

  return (
    <ScrollView
      flex={1}
      showsVerticalScrollIndicator={false}
      backgroundColor="$background"
    >
      <YStack
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$10"
        gap="$4"
      >
        {/* Summary stat cards */}
        {STATS.map((s) => (
          <StatsCard
            key={s.title}
            title={s.title}
            value={s.value}
            suffix={s.suffix}
            icon={<s.icon size={22} color={s.fg} />}
            iconBg={s.bg}
          />
        ))}

        {/* Top Service Flow Achievers */}
        <SectionTitle>Top Service Flow Achievers</SectionTitle>
        <TableMain
          columns={flowColumns}
          data={flowPaging.slice(flowRows)}
          totalItems={flowRows.length}
          onFetchData={flowPaging.onFetch}
          enablePagination
          enableSorting
          itemsPerPage={flowPaging.limit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No flow achievers"
          isLoading={flowAchieversLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />

        {/* Top CSAT Achievers */}
        <SectionTitle>Top CSAT Achievers</SectionTitle>
        <TableMain
          columns={csatColumns}
          data={csatPaging.slice(csatRows)}
          totalItems={csatRows.length}
          onFetchData={csatPaging.onFetch}
          enablePagination
          enableSorting
          itemsPerPage={csatPaging.limit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No CSAT achievers"
          isLoading={csatAchieversLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />

        {/* Top Revenue Achievers */}
        <SectionTitle>Top Revenue Achievers</SectionTitle>
        <TableMain
          columns={revenueColumns}
          data={revenuePaging.slice(revenueRows)}
          totalItems={revenueRows.length}
          onFetchData={revenuePaging.onFetch}
          enablePagination
          enableSorting
          itemsPerPage={revenuePaging.limit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No revenue achievers"
          isLoading={revenueAchieversLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />

        {/* Post-Service Followup */}
        <SectionTitle>Post Service Followup Status</SectionTitle>
        <TableMain
          columns={followupColumns}
          data={followupPaging.slice(followupRows)}
          totalItems={followupRows.length}
          onFetchData={followupPaging.onFetch}
          enablePagination
          enableSorting
          itemsPerPage={followupPaging.limit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No followup data"
          isLoading={postServiceFollowupLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />

        {/* Customer Satisfaction */}
        <SectionTitle>Customer Satisfaction Status</SectionTitle>
        <TableMain
          columns={satisfactionColumns}
          data={satisfactionPaging.slice(satisfactionRows)}
          totalItems={satisfactionRows.length}
          onFetchData={satisfactionPaging.onFetch}
          enablePagination
          enableSorting
          itemsPerPage={satisfactionPaging.limit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No satisfaction data"
          isLoading={customerSatisfactionLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />
      </YStack>
    </ScrollView>
  );
}
