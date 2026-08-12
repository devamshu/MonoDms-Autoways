import { useScreenRefresh } from "@/components/workspace/useScreenRefresh";
import { StatsCard } from "@/host/dms-management/components/custom/dashboard/statsCard";
import { useFilters } from "@/host/dms-management/components/custom/filter/filterContext";
import { TableMain } from "@/host/dms-management/components/custom/table/main";
import { Column, FetchParams } from "@/host/dms-management/components/custom/table/types";
import {
    Boxes,
    CheckCircle,
    Clock,
    DollarSign,
    PackageX,
    ShoppingCart,
    TrendingUp,
    Warehouse,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Spinner, Text, useTheme, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../app/features/hooks";
import {
    fetchInventoryTurnover,
    fetchOrderSummary,
    fetchOrderVsDispatch,
    fetchSparepartSummary,
} from "@/host/dms-management/app/features/dashboard/sparepart/store/sparepart.thunks";

export default function SparePartDashboard() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { activeFilters } = useFilters();

  const {
    summary,
    summaryLoading,
    orderSummary,
    inventoryTurnover,
    inventoryTurnoverLoading,
    orderVsDispatch,
    orderVsDispatchLoading,
  } = useAppSelector((state) => state.managementSparepart);

  const [turnoverPage, setTurnoverPage] = useState(1);
  const [turnoverLimit, setTurnoverLimit] = useState(5);
  const [dispatchPage, setDispatchPage] = useState(1);
  const [dispatchLimit, setDispatchLimit] = useState(5);

  useEffect(() => {
    dispatch(fetchSparepartSummary(activeFilters));
    dispatch(fetchOrderSummary(activeFilters));
    dispatch(fetchInventoryTurnover(activeFilters));
    dispatch(fetchOrderVsDispatch(activeFilters));
  }, [dispatch, activeFilters]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      dispatch(fetchSparepartSummary(activeFilters)),
      dispatch(fetchOrderSummary(activeFilters)),
      dispatch(fetchInventoryTurnover(activeFilters)),
      dispatch(fetchOrderVsDispatch(activeFilters)),
    ]);
  }, [dispatch, activeFilters]);

  const { refreshControl } = useScreenRefresh(handleRefresh);

  const getTrend = (change: number) => ({
    type: change >= 0 ? ("increase" as const) : ("decrease" as const),
    percentage: Math.abs(change),
    comparisonText: "vs last period",
  });

  const stats = summary?.statistics;
  const orders = orderSummary?.order_summary;

  const turnoverRows = inventoryTurnover?.monthly_turnover ?? [];
  const dispatchRows = orderVsDispatch?.monthly_order_vs_dispatch ?? [];

  const pagedTurnover = useMemo(
    () =>
      turnoverRows.slice(
        (turnoverPage - 1) * turnoverLimit,
        turnoverPage * turnoverLimit,
      ),
    [turnoverRows, turnoverPage, turnoverLimit],
  );

  const pagedDispatch = useMemo(
    () =>
      dispatchRows.slice(
        (dispatchPage - 1) * dispatchLimit,
        dispatchPage * dispatchLimit,
      ),
    [dispatchRows, dispatchPage, dispatchLimit],
  );

  const onTurnoverFetch = useCallback(async (params: FetchParams) => {
    setTurnoverPage(params.page);
    setTurnoverLimit(params.limit);
  }, []);

  const onDispatchFetch = useCallback(async (params: FetchParams) => {
    setDispatchPage(params.page);
    setDispatchLimit(params.limit);
  }, []);

  const turnoverColumns: Column[] = [
    { id: "month_name", label: "Month", accessor: "month_name", width: 130 },
    {
      id: "inventory_value",
      label: "Inventory Value",
      accessor: "inventory_value",
      align: "center",
      width: 130,
    },
    {
      id: "cogs",
      label: "COGS",
      accessor: "cogs",
      align: "center",
      width: 100,
    },
    {
      id: "turnover_ratio",
      label: "Turnover Ratio",
      accessor: "turnover_ratio",
      align: "center",
      width: 120,
    },
  ];

  const dispatchColumns: Column[] = [
    { id: "month_name", label: "Month", accessor: "month_name", width: 130 },
    {
      id: "order_quantity",
      label: "Ordered",
      accessor: "order_quantity",
      align: "center",
      width: 90,
    },
    {
      id: "dispatch_quantity",
      label: "Dispatched",
      accessor: "dispatch_quantity",
      align: "center",
      width: 100,
    },
    {
      id: "remaining_quantity",
      label: "Remaining",
      accessor: "remaining_quantity",
      align: "center",
      width: 100,
    },
    {
      id: "fulfillment_rate",
      label: "Fulfillment %",
      accessor: "fulfillment_rate",
      align: "center",
      width: 110,
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

  // ---------- Stat cards: summary statistics + order summary ----------
  const STATS = [
    {
      title: "Total Stock Quantity",
      value: stats?.total_stock_quantity.current ?? 0,
      icon: Boxes,
      fg: theme?.statIconIndigo?.val,
      bg: theme?.statIconBackgroundIndigo?.val,
      trend: getTrend(stats?.total_stock_quantity.change ?? 0),
    },
    {
      title: "Total Stock Value",
      prefix: "NPR ",
      value: stats?.total_stock_value.current ?? 0,
      icon: Warehouse,
      fg: theme?.statIconEmerald?.val,
      bg: theme?.statIconBackgroundEmerald?.val,
      trend: getTrend(stats?.total_stock_value.change ?? 0),
    },
    {
      title: "Total Purchase Value",
      prefix: "NPR ",
      value: stats?.total_purchase_value.current ?? 0,
      icon: DollarSign,
      fg: theme?.statIconAmber?.val,
      bg: theme?.statIconBackgroundAmber?.val,
      trend: getTrend(stats?.total_purchase_value.change ?? 0),
    },
    {
      title: "Pending Backorders",
      value: stats?.pending_backorder_quantity.current ?? 0,
      icon: PackageX,
      fg: theme?.pending?.val,
      bg: theme?.pendingBackground?.val,
      trend: getTrend(stats?.pending_backorder_quantity.change ?? 0),
    },
    {
      title: "Inventory Turnover Ratio",
      value: stats?.inventory_turnover_ratio.current ?? 0,
      icon: TrendingUp,
      fg: theme?.ongoing?.val,
      bg: theme?.ongoingBackground?.val,
      trend: getTrend(stats?.inventory_turnover_ratio.change ?? 0),
    },
    {
      title: "Holding Cost Value",
      prefix: "NPR ",
      value: stats?.holding_cost_value.current ?? 0,
      icon: DollarSign,
      fg: theme?.success?.val,
      bg: theme?.successBackground?.val,
      trend: getTrend(stats?.holding_cost_value.change ?? 0),
    },
  ];

  // Order summary as a compact second row of cards
  const ORDER_STATS = [
    {
      title: "Total Orders",
      value: orders?.total_orders.count ?? 0,
      icon: ShoppingCart,
      fg: theme?.statIconIndigo?.val,
      bg: theme?.statIconBackgroundIndigo?.val,
    },
    {
      title: "Completed Orders",
      value: orders?.completed_orders.count ?? 0,
      icon: CheckCircle,
      fg: theme?.statIconEmerald?.val,
      bg: theme?.statIconBackgroundEmerald?.val,
    },
    {
      title: "Pending Orders",
      value: orders?.pending_orders.count ?? 0,
      icon: Clock,
      fg: theme?.pending?.val,
      bg: theme?.pendingBackground?.val,
    },
    {
      title: "Canceled Orders",
      value: orders?.canceled_orders.count ?? 0,
      icon: PackageX,
      fg: theme?.error?.val,
      bg: theme?.errorBackground?.val,
    },
  ];

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
        {/* Summary stat cards */}
        {STATS.map((s) => (
          <StatsCard
            key={s.title}
            title={s.title}
            value={s.value}
            prefix={s.prefix}
            icon={<s.icon size={22} color={s.fg} />}
            iconBg={s.bg}
            trend={s.trend}
          />
        ))}

        {/* Order summary cards */}
        <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
          Order Summary
        </Text>
        {ORDER_STATS.map((s) => (
          <StatsCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={<s.icon size={22} color={s.fg} />}
            iconBg={s.bg}
          />
        ))}

        {/* Monthly Inventory Turnover table */}
        <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
          Monthly Inventory Turnover
        </Text>
        <TableMain
          columns={turnoverColumns}
          data={pagedTurnover}
          totalItems={turnoverRows.length}
          onFetchData={onTurnoverFetch}
          enablePagination
          enableSorting
          itemsPerPage={turnoverLimit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.month}
          emptyMessage="No turnover data"
          isLoading={inventoryTurnoverLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />

        {/* Order vs Dispatch table */}
        <Text fontSize="$5" fontWeight="600" color="$color12" marginTop="$2">
          Order vs Dispatch
        </Text>
        <TableMain
          columns={dispatchColumns}
          data={pagedDispatch}
          totalItems={dispatchRows.length}
          onFetchData={onDispatchFetch}
          enablePagination
          enableSorting
          itemsPerPage={dispatchLimit}
          itemsPerPageOptions={[5, 10, 15]}
          keyExtractor={(item) => item.month}
          emptyMessage="No dispatch data"
          isLoading={orderVsDispatchLoading}
          enableSearch={false}
          enableColumnManagement={false}
          showCard
        />
      </YStack>
    </ScrollView>
  );
}
