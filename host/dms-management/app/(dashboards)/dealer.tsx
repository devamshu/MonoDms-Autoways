import { PipelineBarChart } from "@/components/custom/dashboard/barChart";
import { InquiryDonutChart } from "@/components/custom/dashboard/inqueryDonutChart";
import { StatsCard } from "@/components/custom/dashboard/statsCard";
import { useFilters } from "@/components/custom/filter/filterContext";
import { TableMain } from "@/components/custom/table/main";
import { Column, FetchParams } from "@/components/custom/table/types";
import {
    CheckCircle,
    Package,
    ShoppingBag,
    Store,
    TrendingUp,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Spinner, Text, useTheme, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import {
    fetchCustomerStatus,
    fetchDealerSummary,
    fetchLeadConversionMonthly,
    fetchStockPipeline,
} from "../features/dashboard/dealer/store/dealer.thunks";
import { BAR_COLOR_TOKENS, useChartColors } from "../utils/dashboard";

interface MonthlyConversionRow {
  id: string;
  month: string;
  total_inquiries: number;
  converted_count: number;
  conversion_rate: number;
}

export default function DealerDashboard() {
  const theme = useTheme();
  const donutColors = useChartColors();
  const barColors = useChartColors(BAR_COLOR_TOKENS);
  const dispatch = useAppDispatch();
  const { activeFilters } = useFilters();

  const {
    summary,
    summaryLoading,
    customerStatus,
    stockPipeline,
    stockPipelineLoading,
    leadConversion,
    leadConversionLoading,
  } = useAppSelector((state) => state.managementDealer);

  console.log("Stock Pipeline Data:", stockPipeline);
  console.log("Stock Pipeline Loading:", stockPipelineLoading);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    dispatch(fetchDealerSummary(activeFilters));
    dispatch(fetchCustomerStatus(activeFilters));
    dispatch(fetchStockPipeline(activeFilters));
    dispatch(fetchLeadConversionMonthly(activeFilters));
  }, [dispatch, activeFilters]);

  const getTrend = (change: number) => ({
    type: change >= 0 ? ("increase" as const) : ("decrease" as const),
    percentage: Math.abs(change),
    comparisonText: "vs last period",
  });

  // monthly_data is an array of objects; month_name is already formatted
  const monthlyRows = useMemo<MonthlyConversionRow[]>(() => {
    const rows = leadConversion?.monthly_data ?? [];
    return rows.map((r) => ({
      id: r.month,
      month: r.month_name,
      total_inquiries: r.total_inquiries,
      converted_count: r.converted_count,
      conversion_rate: r.conversion_rate,
    }));
  }, [leadConversion]);

  const pagedMonthlyRows = useMemo(
    () => monthlyRows.slice((page - 1) * limit, page * limit),
    [monthlyRows, page, limit],
  );

  const onFetchMonthly = useCallback(async (params: FetchParams) => {
    setPage(params.page);
    setLimit(params.limit);
  }, []);

  const monthlyColumns: Column[] = [
    {
      id: "month",
      label: "Month",
      accessor: "month",
      sortable: true,
      width: 130,
    },
    {
      id: "total_inquiries",
      label: "Inquiries",
      accessor: "total_inquiries",
      sortable: true,
      width: 100,
      align: "center",
    },
    {
      id: "converted_count",
      label: "Converted",
      accessor: "converted_count",
      sortable: true,
      width: 100,
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

  const stats = summary?.statistics;
  const cust = customerStatus;

  // ---------- Summary stat cards ----------
  const STATS = [
    {
      title: "Total Dealers",
      value: stats?.total_dealers.current ?? 0,
      icon: Store,
      fg: theme?.statIconIndigo?.val,
      bg: theme?.statIconBackgroundIndigo?.val,
      trend: getTrend(stats?.total_dealers.change ?? 0),
    },
    {
      title: "Total Orders",
      value: stats?.total_orders.current ?? 0,
      icon: ShoppingBag,
      fg: theme?.statIconEmerald?.val,
      bg: theme?.statIconBackgroundEmerald?.val,
      trend: getTrend(stats?.total_orders.change ?? 0),
    },
    {
      title: "Orders Received",
      value: stats?.orders_received.current ?? 0,
      icon: CheckCircle,
      fg: theme?.statIconAmber?.val,
      bg: theme?.statIconBackgroundAmber?.val,
      trend: getTrend(stats?.orders_received.change ?? 0),
    },
    {
      title: "Total Stock",
      value: stats?.total_stock.current ?? 0,
      icon: Package,
      fg: theme?.ongoing?.val,
      bg: theme?.ongoingBackground?.val,
      trend: getTrend(stats?.total_stock.change ?? 0),
    },
    {
      title: "Billed Stock",
      value: stats?.billed_stock.current ?? 0,
      icon: TrendingUp,
      fg: theme?.pending?.val,
      bg: theme?.pendingBackground?.val,
      trend: getTrend(stats?.billed_stock.change ?? 0),
    },
    {
      title: "Sold Stock",
      value: stats?.sold_stock.current ?? 0,
      icon: ShoppingBag,
      fg: theme?.success?.val,
      bg: theme?.successBackground?.val,
      trend: getTrend(stats?.sold_stock.change ?? 0),
    },
  ];

  // ---------- Customer status — donut ----------
  const customerStatusData = [
    {
      label: "First-time",
      value: cust?.first_customers_count ?? 0,
      color: donutColors[0],
    },
    {
      label: "Repeat",
      value: cust?.repeat_customers_count ?? 0,
      color: donutColors[1],
    },
    {
      label: "Anonymous",
      value: cust?.anonymous_inquiries_count ?? 0,
      color: donutColors[2],
    },
  ].filter((d) => d.value > 0);

  // ---------- Stock pipeline — bar chart ----------
  const pipelineBars =
    stockPipeline?.by_status?.map((s, i) => ({
      label: s.status,
      value: s.count,
      color: barColors[i % barColors.length],
      labelColor: barColors[i % barColors.length],
    })) ?? [
      { label: "STOCK", value: 0, color: barColors[0], labelColor: barColors[0] },
      { label: "ON_TEST_DRIVE", value: 0, color: barColors[1], labelColor: barColors[1] },
      { label: "BILLED", value: 0, color: barColors[2], labelColor: barColors[2] },
      { label: "SOLD", value: 0, color: barColors[3], labelColor: barColors[3] },
      { label: "BOOKED", value: 0, color: barColors[4], labelColor: barColors[4] },
      { label: "CANCELLED", value: 0, color: barColors[5], labelColor: barColors[5] },
      { label: "DAMAGED", value: 0, color: barColors[6], labelColor: barColors[6] },
    ];

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
            icon={<s.icon size={22} color={s.fg} />}
            iconBg={s.bg}
            trend={s.trend}
          />
        ))}

        {/* Customer Status — donut */}
        <InquiryDonutChart title="Customer Status" data={customerStatusData} />

        {/* Stock Pipeline — bar chart */}
        <PipelineBarChart
          title="Stock Pipeline Status"
          summaryLabel={`Total Stock: ${stockPipeline?.total?.toLocaleString() ?? 0}`}
          data={pipelineBars}
          loading={stockPipelineLoading}
        />

        {/* Monthly Lead Conversion — table */}
        <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
          Monthly Lead Conversion
        </Text>
        <TableMain
          columns={monthlyColumns}
          data={pagedMonthlyRows}
          totalItems={monthlyRows.length}
          onFetchData={onFetchMonthly}
          enablePagination
          enableSorting
          itemsPerPage={limit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No conversion data"
          isLoading={leadConversionLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />
      </YStack>
    </ScrollView>
  );
}
