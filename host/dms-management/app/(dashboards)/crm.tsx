import { getCustomerColumns } from "@/components/custom/columns/customer.columns";
import { InquiryDonutChart } from "@/components/custom/dashboard/inqueryDonutChart";
import { StatsCard } from "@/components/custom/dashboard/statsCard";
import { useFilters } from "@/components/custom/filter/filterContext";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { TableMain } from "@/components/custom/table/main";
import { Column, FetchParams } from "@/components/custom/table/types";
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
import {
  fetchCrmSummary,
  fetchCustomers,
  fetchInquiryKind,
  fetchInquiryStatus,
  fetchMonthlyConversion,
  fetchPaymentMode,
} from "../features/dashboard/crm/store/dashboard.thunk";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { LeadDetailScreen } from "../lead/LeadDetailScreen";
import { useChartColors } from "../utils/dashboard";

interface MonthlyConversionRow {
  id: string;
  month: string;
  leads: number;
  deals: number;
  conversion_rate: number;
}

export default function CrmDashboard() {
  const theme = useTheme();
  const donutColors = useChartColors();
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

  // Charts/summary refetch when filters change
  useEffect(() => {
    dispatch(fetchCrmSummary(activeFilters));
    dispatch(fetchInquiryStatus(activeFilters));
    dispatch(fetchInquiryKind(activeFilters));
    dispatch(fetchMonthlyConversion(activeFilters));
    dispatch(fetchPaymentMode(activeFilters));
  }, [dispatch, activeFilters]);

  const getTrend = (pctChange: number | null) => ({
    type:
      pctChange !== null && pctChange >= 0
        ? ("increase" as const)
        : ("decrease" as const),
    percentage: pctChange !== null ? Math.abs(pctChange) : 0,
    comparisonText: "vs last month",
  });

  // ---------- Monthly conversion table ----------
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

  // ---------- Customer / Inquiry table ----------
  const handleCustomerPress = useCallback(
    (id: string) => {
      open(<LeadDetailScreen id={id} />, "Lead Details");
    },
    [open],
  );

  const customerColumns = getCustomerColumns(handleCustomerPress);

  // Server-paginated, like the reference CustomerScreen
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
        color: donutColors[i % donutColors.length],
      })) ?? [];

  const inquiryKindData =
    inquiryKind?.inquiry_kind_count
      .filter((k) => k.count > 0)
      .map((k, i) => ({
        label: k.kind,
        value: k.count,
        color: donutColors[i % donutColors.length],
      })) ?? [];

  const paymentModeData =
    paymentMode?.payment_mode_count
      .filter((p) => p.count > 0)
      .map((p, i) => ({
        label: p.payment_mode,
        value: p.count,
        color: donutColors[i % donutColors.length],
      })) ?? [];

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
        {/* Stats cards */}
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

        <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
          Recent Leads
        </Text>
        <TableMain
          columns={customerColumns}
          data={customers}
          totalItems={customersCount}
          onFetchData={fetchCustomerData}
          enableSearch={false}
          enablePagination={false}
          enableColumnManagement={false}
          enableSorting
          itemsPerPage={5}
          itemsPerPageOptions={[5, 10, 25]}
          keyExtractor={(item) =>
            item?.id?.toString() ?? Math.random().toString()
          }
          emptyMessage="No leads found"
          isLoading={customersLoading}
          showCard
        />

        <InquiryDonutChart title="Inquiry Status" data={inquiryStatusData} />

        {/* Lead Conversion table */}
        <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
          Lead Conversion
        </Text>
        <TableMain
          columns={monthlyColumns}
          data={pagedMonthlyRows}
          totalItems={monthlyRows.length}
          onFetchData={fetchMonthlyData}
          enablePagination
          enableSorting
          itemsPerPage={monthlyLimit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No conversion data"
          isLoading={monthlyConversionLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />

        {/* Charts */}
        <InquiryDonutChart title="Inquiry Kind" data={inquiryKindData} />
        <InquiryDonutChart title="Payment Mode" data={paymentModeData} />

        {/* Customer / Inquiry table — server paginated */}
      </YStack>
    </ScrollView>
  );
}
