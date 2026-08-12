import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import HomeOrdersTable from "@/host/dms-warehouse/app/dashboard/homeOrdersTable";
import { HomePartsTable } from "@/host/dms-warehouse/app/dashboard/homePartsTable";
import HomeVehicleTable from "@/host/dms-warehouse/app/dashboard/homeVehicleTable";
import {
  fetchOrdersSummary,
  fetchPartsSummary,
} from "@/host/dms-warehouse/app/features/dashboard/store/dashboard.thunks";
import { fetchVehicleStockInventory } from "@/host/dms-warehouse/app/features/vehicle/store/vehicle.thunks";
import { StatsCard } from "@/host/dms-warehouse/components/custom/dashboard/statsCard";
import { Box, CarFrontIcon, Wrench } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { useTheme, YStack } from "tamagui";

export default function HomeScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { partsData, ordersData, loading } = useAppSelector(
    (state) => state.warehouseDashboard,
  );
  const { count: vehiclesCount, loading: vehiclesLoading } = useAppSelector(
    (state) => state.warehouseVehicleStock,
  );

  const fetchDashboardData = useCallback(() => {
    dispatch(fetchPartsSummary({}));
    dispatch(fetchOrdersSummary({}));
    dispatch(fetchVehicleStockInventory({ page: 1, page_size: 10 }));
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalVehicles = vehiclesCount || 0;
  const totalParts = partsData?.summary?.total_stock_quantity ?? 0;
  const totalOrders = ordersData?.order_summary?.total_orders?.count ?? 0;

  const isLoading = loading.parts || loading.orders || vehiclesLoading;

  return (
    <YStack flex={1} backgroundColor="$primary">
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        overflow="hidden"
      >
        <ScreenScrollView
          padded={false}
          onRefresh={fetchDashboardData}
          contentContainerStyle={{
            padding: 16,
            gap: 16,
          }}
        >
          {/* Total Vehicle Card */}
          <StatsCard
            title="Total Vehicle"
            value={isLoading ? "Loading..." : totalVehicles.toLocaleString()}
            icon={<CarFrontIcon size={24} color={theme.statIconIndigo?.val} />}
            iconBg={theme.statIconBackgroundIndigo?.val}
            trend={{
              type: "increase",
              percentage: 7,
              comparisonText: "vs last month",
            }}
          />

          {/* Total Parts Card */}
          <StatsCard
            title="Total Parts"
            value={loading.parts ? "Loading..." : totalParts.toLocaleString()}
            icon={<Wrench size={24} color={theme.statIconEmerald?.val} />}
            iconBg={theme.statIconBackgroundEmerald?.val}
            trend={{
              type: "increase",
              percentage: 7,
              comparisonText: "vs last month",
            }}
          />

          {/* Total Order Card */}
          <StatsCard
            title="Total Order"
            value={loading.orders ? "Loading..." : totalOrders.toLocaleString()}
            icon={<Box size={24} color={theme.statIconAmber?.val} />}
            iconBg={theme.statIconBackgroundAmber?.val}
            trend={{
              type: "increase",
              percentage: 7,
              comparisonText: "vs last month",
            }}
          />
          <HomeVehicleTable />
          <HomePartsTable />
          <HomeOrdersTable />
        </ScreenScrollView>
      </YStack>
    </YStack>
  );
}
