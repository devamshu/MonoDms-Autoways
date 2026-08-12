import { useScreenRefresh } from "@/components/workspace/useScreenRefresh";
import {
  fetchDispatchSummary,
  fetchRetailBilling,
} from "@/host/dms-management/app/features/dashboard/logistic/store/logistic.thunks";
import { BillingRow } from "@/host/dms-management/app/features/dashboard/logistic/types";
import { useChartColors } from "@/host/dms-management/app/utils/dashboard";
import { InquiryDonutChart } from "@/host/dms-management/components/custom/dashboard/inqueryDonutChart";
import { StatsCard } from "@/host/dms-management/components/custom/dashboard/statsCard";
import { useFilters } from "@/host/dms-management/components/custom/filter/filterContext";
import { TableMain } from "@/host/dms-management/components/custom/table/main";
import {
  Column,
  FetchParams,
} from "@/host/dms-management/components/custom/table/types";
import { Box, Package, TruckElectricIcon } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, YStack, useTheme } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../app/features/hooks";

// Overrides the shared palette: these map to dispatch states, not slice order.
const DISPATCH_STATUS_TOKENS = [
  "statIconAmber",
  "ongoing",
  "primary",
  "statIconEmerald",
  "error",
];

export default function LogisticDashboard() {
  const theme = useTheme();
  const donutColors = useChartColors(DISPATCH_STATUS_TOKENS);
  const dispatch = useAppDispatch();
  const { activeFilters } = useFilters();

  const { dispatchSummary, retailBilling, retailBillingLoading } =
    useAppSelector((state) => state.managementLogistic);

  const [retailPage, setRetailPage] = useState(1);
  const [retailLimit, setRetailLimit] = useState(6);
  const [billPage, setBillPage] = useState(1);
  const [billLimit, setBillLimit] = useState(6);

  useEffect(() => {
    dispatch(fetchDispatchSummary(activeFilters));
    dispatch(fetchRetailBilling(activeFilters));
  }, [dispatch, activeFilters]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      dispatch(fetchDispatchSummary(activeFilters)),
      dispatch(fetchRetailBilling(activeFilters)),
    ]);
  }, [dispatch, activeFilters]);

  const { refreshControl } = useScreenRefresh(handleRefresh);

  // Live from dispatch summary
  const STATS = [
    {
      title: "Pending Dispatched",
      value: dispatchSummary?.pending_dispatched ?? 0,
      icon: Package,
      fg: theme?.statIconAmber?.val,
      bg: theme?.statIconBackgroundAmber?.val,
    },
    {
      title: "Transit Dispatched",
      value: dispatchSummary?.transit_dispatched ?? 0,
      icon: TruckElectricIcon,
      fg: theme?.ongoing?.val,
      bg: theme?.ongoingBackground?.val,
    },
    {
      title: "Stock Dispatched",
      value: dispatchSummary?.stock_dispatched ?? 0,
      icon: Box,
      fg: theme?.statIconEmerald?.val,
      bg: theme?.statIconBackgroundEmerald?.val,
    },
  ];

  const dispatchData = [
    {
      label: "Pending",
      value: dispatchSummary?.pending_dispatched ?? 0,
      color: donutColors[0],
    },
    {
      label: "In Transit",
      value: dispatchSummary?.transit_dispatched ?? 0,
      color: donutColors[1],
    },
    {
      label: "Stock",
      value: dispatchSummary?.stock_dispatched ?? 0,
      color: donutColors[2],
    },
  ].filter((d) => d.value > 0);

  const retailRows = useMemo<BillingRow[]>(
    () =>
      (retailBilling?.results ?? []).map((r) => ({
        id: r.month,
        month: r.month,
        current_year: r.current_year_retail,
        previous_year: r.previous_year_retail,
      })),
    [retailBilling],
  );

  const billingRows = useMemo<BillingRow[]>(
    () =>
      (retailBilling?.results ?? []).map((r) => ({
        id: r.month,
        month: r.month,
        current_year: r.current_year_billing,
        previous_year: r.previous_year_billing,
      })),
    [retailBilling],
  );

  const pagedRetail = useMemo(
    () =>
      retailRows.slice(
        (retailPage - 1) * retailLimit,
        retailPage * retailLimit,
      ),
    [retailRows, retailPage, retailLimit],
  );

  const pagedBilling = useMemo(
    () => billingRows.slice((billPage - 1) * billLimit, billPage * billLimit),
    [billingRows, billPage, billLimit],
  );

  const onRetailFetch = useCallback(async (params: FetchParams) => {
    setRetailPage(params.page);
    setRetailLimit(params.limit);
  }, []);

  const onBillFetch = useCallback(async (params: FetchParams) => {
    setBillPage(params.page);
    setBillLimit(params.limit);
  }, []);

  // Shared column shape for both tables
  const billingColumns: Column[] = [
    {
      id: "month",
      label: "Month",
      accessor: "month",
      sortable: true,
      width: 130,
    },
    {
      id: "current_year",
      label: "Current Year",
      accessor: "current_year",
      sortable: true,
      width: 120,
      align: "center",
    },
    {
      id: "previous_year",
      label: "Previous Year",
      accessor: "previous_year",
      sortable: true,
      width: 120,
      align: "center",
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
      refreshControl={refreshControl}
    >
      <YStack
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$10"
        gap="$4"
      >
        {/* Dispatch summary stat cards */}
        {STATS.map((s) => (
          <StatsCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={<s.icon size={22} color={s.fg} />}
            iconBg={s.bg}
          />
        ))}

        {/* Dispatch Status — donut (pending / in transit / stock) */}
        <InquiryDonutChart title="Dispatch Status" data={dispatchData} />

        {/* Retail Report */}
        <SectionTitle>Retail Report</SectionTitle>
        <TableMain
          columns={billingColumns}
          data={pagedRetail}
          totalItems={retailRows.length}
          onFetchData={onRetailFetch}
          enablePagination
          enableSorting
          itemsPerPage={retailLimit}
          itemsPerPageOptions={[6, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No retail data"
          isLoading={retailBillingLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />

        {/* Billing Report */}
        <SectionTitle>Billing Report</SectionTitle>
        <TableMain
          columns={billingColumns}
          data={pagedBilling}
          totalItems={billingRows.length}
          onFetchData={onBillFetch}
          enablePagination
          enableSorting
          itemsPerPage={billLimit}
          itemsPerPageOptions={[6, 10, 15]}
          keyExtractor={(item) => item.id}
          emptyMessage="No billing data"
          isLoading={retailBillingLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />
      </YStack>
    </ScrollView>
  );
}
