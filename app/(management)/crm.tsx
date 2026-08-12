import { MonthlyConversionRow } from "@/host/dms-crm/app/features/dashboard/types";
import {
  fetchCrmSummary,
  fetchCustomers,
  fetchInquiryKind,
  fetchInquiryStatus,
  fetchMonthlyConversion,
  fetchPaymentMode,
} from "@/host/dms-management/app/features/dashboard/crm/store/dashboard.thunk";
import { LeadDetailScreen } from "@/host/dms-management/app/lead/LeadDetailScreen";
import {
  getTrend,
  useChartColors,
} from "@/host/dms-management/app/utils/dashboard";
import { useScreenRefresh } from "@/components/workspace/useScreenRefresh";
import { InquiryDonutChart } from "@/host/dms-management/components/custom/dashboard/inqueryDonutChart";
import { MonthlyConversionTable } from "@/host/dms-management/components/custom/dashboard/monthlyConversionTable";
import { RecentLeadsTable } from "@/host/dms-management/components/custom/dashboard/recentTableLeads";
import { StatsCard } from "@/host/dms-management/components/custom/dashboard/statsCard";
import { useFilters } from "@/host/dms-management/components/custom/filter/filterContext";
import {
  Column,
  FetchParams,
} from "@/host/dms-management/components/custom/table/types";
import {
  DollarSign,
  Phone,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Spinner, Text, useTheme, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../app/features/hooks";
import { useSlideOpen } from "../../components/auth/slideOpen";

const DONUT_COLOR_TOKENS = [
  "primary",
  "statIconEmerald",
  "statIconAmber",
  "ongoing",
  "error",
  "pending",
  "statIconViolet",
];

export default function CrmDashboard() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { activeFilters } = useFilters();
  const { open } = useSlideOpen();

  const {
    crmSummary,
    loading,
    inquiryStatus,
    inquiryKind,
    monthlyConversion,
    monthlyConversionLoading,
    paymentMode,
    customers,
    customersCount,
    customersLoading,
  } = useAppSelector((state) => state.managementDashboard);

  const [monthlyPage, setMonthlyPage] = useState(1);
  const [monthlyLimit, setMonthlyLimit] = useState(5);
  const donutColors = useChartColors(DONUT_COLOR_TOKENS);

  useEffect(() => {
    dispatch(fetchCrmSummary(activeFilters));
    dispatch(fetchInquiryStatus(activeFilters));
    dispatch(fetchInquiryKind(activeFilters));
    dispatch(fetchMonthlyConversion(activeFilters));
    dispatch(fetchPaymentMode(activeFilters));
  }, [dispatch, activeFilters]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      dispatch(fetchCrmSummary(activeFilters)),
      dispatch(fetchInquiryStatus(activeFilters)),
      dispatch(fetchInquiryKind(activeFilters)),
      dispatch(fetchMonthlyConversion(activeFilters)),
      dispatch(fetchPaymentMode(activeFilters)),
      dispatch(fetchCustomers({ page: 1, page_size: 5, ...activeFilters })),
    ]);
  }, [dispatch, activeFilters]);

  const { refreshControl } = useScreenRefresh(handleRefresh);

  const monthlyRows = useMemo<MonthlyConversionRow[]>(() => {
    if (!monthlyConversion) return [];
    return monthlyConversion.months.map((month, i) => ({
      id: month,
      month,
      leads: monthlyConversion.leads[i] ?? 0,
      deals: monthlyConversion.deals[i] ?? 0,
      conversion_rate: monthlyConversion.conversion_rate[i] ?? 0,
    }));
  }, [monthlyConversion]);

  const pagedMonthlyRows = useMemo(
    () =>
      monthlyRows.slice(
        (monthlyPage - 1) * monthlyLimit,
        monthlyPage * monthlyLimit,
      ),
    [monthlyRows, monthlyPage, monthlyLimit],
  );

  const fetchMonthlyData = useCallback(async (params: FetchParams) => {
    setMonthlyPage(params.page);
    setMonthlyLimit(params.limit);
  }, []);

  const monthlyColumns: Column[] = [
    {
      id: "month",
      label: "Month",
      accessor: "month",
      sortable: true,
      width: 100,
    },
    {
      id: "leads",
      label: "Leads",
      accessor: "leads",
      sortable: true,
      width: 90,
      align: "center",
    },
    {
      id: "deals",
      label: "Deals",
      accessor: "deals",
      sortable: true,
      width: 90,
      align: "center",
    },
    {
      id: "conversion_rate",
      label: "Conversion %",
      accessor: "conversion_rate",
      sortable: true,
      width: 120,
      align: "center",
      render: (value: number) => (
        <Text numberOfLines={1} color="$color">
          {value}%
        </Text>
      ),
    },
  ];

  const handleCustomerPress = useCallback(
    (id: string) => {
      open(<LeadDetailScreen id={id} />, "Lead Details");
    },
    [open],
  );

  const fetchCustomerData = useCallback(
    async (params: FetchParams) => {
      dispatch(
        fetchCustomers({
          page: 1,
          page_size: 5,
          search: params.search,
          ...activeFilters,
        }),
      );
    },
    [dispatch, activeFilters],
  );

  if (loading && !crmSummary) {
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

  const STATS = [
    {
      title: "Total Leads",
      value: crmSummary?.total_leads ?? 0,
      icon: Users,
      fg: theme?.statIconIndigo?.val,
      bg: theme?.statIconBackgroundIndigo?.val,
      trend: getTrend(crmSummary?.total_leads_pct_change ?? null),
    },
    {
      title: "Lead Conversion Rate",
      value: crmSummary?.lead_conversion_rate ?? 0,
      suffix: "%",
      icon: TrendingUp,
      fg: theme?.statIconEmerald?.val,
      bg: theme?.statIconBackgroundEmerald?.val,
      trend: getTrend(crmSummary?.lead_conversion_rate_pct_change ?? null),
    },
    {
      title: "Total Deals",
      value: crmSummary?.total_deals ?? 0,
      icon: ShoppingBag,
      fg: theme?.statIconAmber?.val,
      bg: theme?.statIconBackgroundAmber?.val,
      trend: getTrend(crmSummary?.total_deals_pct_change ?? null),
    },
    {
      title: "Total Bookings",
      value: crmSummary?.total_bookings ?? 0,
      icon: Phone,
      fg: theme?.ongoing?.val,
      bg: theme?.ongoingBackground?.val,
      trend: getTrend(crmSummary?.total_bookings_pct_change ?? null),
    },
    {
      title: "Total Inquiries",
      value: crmSummary?.total_inquiries ?? 0,
      icon: TrendingDown,
      fg: theme?.pending?.val,
      bg: theme?.pendingBackground?.val,
      trend: getTrend(crmSummary?.total_inquiries_pct_change ?? null),
    },
    {
      title: "Total Revenue",
      prefix: "NPR ",
      value: crmSummary?.total_revenue ?? 0,
      icon: DollarSign,
      fg: theme?.success?.val,
      bg: theme?.successBackground?.val,
      trend: getTrend(crmSummary?.total_revenue_pct_change ?? null),
    },
  ];

  const inquiryStatusData =
    inquiryStatus?.inquiry_status_count
      .filter((s) => s.count > 0)
      .map((s, i) => ({
        label: s.status,
        value: s.count,
        color: donutColors[0],
      })) ?? [];

  const inquiryKindData =
    inquiryKind?.inquiry_kind_count
      .filter((k) => k.count > 0)
      .map((k, i) => ({
        label: k.kind,
        value: k.count,
        color: donutColors[1],
      })) ?? [];

  const paymentModeData =
    paymentMode?.payment_mode_count
      .filter((p) => p.count > 0)
      .map((p, i) => ({
        label: p.payment_mode,
        value: p.count,
        color: donutColors[2],
      })) ?? [];

  return (
    <ScrollView
      flex={1}
      showsVerticalScrollIndicator={false}
      backgroundColor="$background"
      refreshControl={refreshControl}
    >
      <YStack
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$10"
        gap="$4"
      >
        {STATS.map((s) => (
          <StatsCard
            key={s.title}
            title={s.title}
            value={s.value}
            prefix={s.prefix}
            suffix={s.suffix}
            icon={<s.icon size={22} color={s.fg} />}
            iconBg={s.bg}
            trend={s.trend}
          />
        ))}

        <RecentLeadsTable
          customers={customers}
          customersCount={customersCount}
          customersLoading={customersLoading}
          onFetchData={fetchCustomerData}
          onPressCustomer={handleCustomerPress}
        />

        <InquiryDonutChart title="Inquiry Status" data={inquiryStatusData} />

        <MonthlyConversionTable
          rows={pagedMonthlyRows}
          totalItems={monthlyRows.length}
          limit={monthlyLimit}
          onFetchData={fetchMonthlyData}
          isLoading={monthlyConversionLoading}
        />

        <InquiryDonutChart title="Inquiry Kind" data={inquiryKindData} />
        <InquiryDonutChart title="Payment Mode" data={paymentModeData} />
      </YStack>
    </ScrollView>
  );
}
