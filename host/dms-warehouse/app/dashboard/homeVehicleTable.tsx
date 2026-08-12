import { router } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { fetchVehicleStockInventory } from "../../app/features/vehicle/store/vehicle.thunks";
import { getVehicleStockColumns } from "../../app/utils/columns/vehicle.columns";
import { AppRoutes } from "../../app/utils/navigation";
import { useFilters } from "../../components/custom/filter/filterContext";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import { VehicleStockDetailScreen } from "../../components/custom/viewDetail/vehicleStockDetailScreen";

export default function HomeVehicleTable() {
  const dispatch = useAppDispatch();
  const { inventory, count, loading } = useAppSelector(
    (state) => state.warehouseVehicleStock,
  );
  const { activeFilters } = useFilters();
  const tableRef = useRef<any>(null);
  const { open } = useSlideOpen();

  const handleVehiclePress = useCallback(
    (id: string) => {
      open(<VehicleStockDetailScreen id={id} />, "Vehicle Details");
    },
    [open],
  );

  const columns = useMemo(
    () => getVehicleStockColumns(handleVehiclePress),
    [handleVehiclePress],
  );

  const fetchData = useCallback(
    async (params: FetchParams) => {
      dispatch(
        fetchVehicleStockInventory(buildTableApiParams(params, activeFilters)),
      );
    },
    [dispatch, activeFilters],
  );

  const handleViewAll = () => {
    router.push(AppRoutes.Vehicle_SCREEN);
  };

  return (
    <YStack marginTop="$4" gap="$4" flex={1} paddingBottom="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="700" color="$color">
          Recent Vehicle
        </Text>
        <Text
          fontSize="$3"
          color="$primary"
          onPress={handleViewAll}
          style={{ cursor: "pointer" }}
        >
          View All
        </Text>
      </XStack>
      <TableMain
        ref={tableRef}
        columns={columns}
        data={inventory.slice(0, 5)}
        totalItems={count}
        onFetchData={fetchData}
        enableSearch
        enablePagination={false}
        enableColumnManagement
        enableSorting
        searchPlaceholder="Search vehicles..."
        keyExtractor={(item: any) => item.id.toString()}
        emptyMessage="No vehicles found"
        isLoading={loading}
        defaultVisibleColumns={["id", "vehicle", "chassis_no"]}
        showCard
      />
    </YStack>
  );
}
