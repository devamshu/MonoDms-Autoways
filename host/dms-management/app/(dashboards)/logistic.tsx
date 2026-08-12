import { InquiryDonutChart } from "@/components/custom/dashboard/inqueryDonutChart";
import { StatsCard } from "@/components/custom/dashboard/statsCard";
import { useFilters } from "@/components/custom/filter/filterContext";
import { TableMain } from "@/components/custom/table/main";
import { Column, FetchParams } from "@/components/custom/table/types";
import { Box, Package, Truck, TruckElectricIcon } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, YStack, useTheme } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import {
    fetchDispatchSummary,
    fetchRetailBilling,
} from "../features/dashboard/logistic/store/logistic.thunks";
import { useChartColors } from "../utils/dashboard";

// Overrides the shared palette: these map to dispatch states, not slice order.
const DISPATCH_STATUS_TOKENS = [
  "statIconAmber",
  "ongoing",
  "primary",
  "statIconEmerald",
  "error",
];

interface BillingRow {
  id: string;
  month: string;
  current_year: number;
  previous_year: number;
}

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

  const STATS = [
    {
      title: "Total Logistics Orders Created",
      value: 245,
      icon: Box,
      fg: theme?.statIconIndigo?.val,
      bg: theme?.statIconBackgroundIndigo?.val,
    },
    {
      title: "Total Item Ordered",
      value: 500,
      icon: Package,
      fg: theme?.statIconEmerald?.val,
      bg: theme?.statIconBackgroundEmerald?.val,
    },
    {
      title: "Total Item Dispatched",
      value: 164,
      icon: Truck,
      fg: theme?.statIconAmber?.val,
      bg: theme?.statIconBackgroundAmber?.val,
    },
    {
      // Live from dispatch summary
      title: "In Transit",
      value: dispatchSummary?.transit_dispatched ?? 0,
      icon: TruckElectricIcon,
      fg: theme?.ongoing?.val,
      bg: theme?.ongoingBackground?.val,
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

  // ---------- Retail rows (retail columns) ----------
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

  // ---------- Billing rows (billing columns) — same API, different fields ----------
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
    >
      <YStack
        paddingHorizontal="$4"
        paddingTop="$4"
        paddingBottom="$10"
        gap="$4"
      >
        {/* Static stat cards */}
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
          itemsPerPageOptions={[5, 10, 15]}
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
          itemsPerPageOptions={[5, 10, 15]}
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
