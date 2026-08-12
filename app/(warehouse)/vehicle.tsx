import { useSlideOpen } from "@/components/auth/slideOpen";
import { getVehicleStockColumns } from "@/host/dms-warehouse/app/utils/columns/vehicle.columns";
import { AddVehicleForm } from "@/host/dms-warehouse/app/vehicle/form/add-vehicle-form";
import { AddFormButton } from "@/host/dms-warehouse/components/custom/buttons/addFormButton";
import { useFilters } from "@/host/dms-warehouse/components/custom/filter/filterContext";
import { buildTableApiParams } from "@/host/dms-warehouse/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-warehouse/components/custom/table/main";

import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { fetchVehicleStockInventory } from "@/host/dms-warehouse/app/features/vehicle/store/vehicle.thunks";
import { FetchParams } from "@/host/dms-warehouse/components/custom/table/types";
import { VehicleStockDetailScreen } from "@/host/dms-warehouse/components/custom/viewDetail/vehicleStockDetailScreen";
import { useCallback, useEffect, useRef, useState } from "react";
import { YStack } from "tamagui";

export default function VehicleScreen() {
  const dispatch = useAppDispatch();
  const { inventory, count, loading } = useAppSelector(
    (state) => state.warehouseVehicleStock,
  );
  const { activeFilters } = useFilters();
  const [rowOffset, setRowOffset] = useState(0);
  const tableRef = useRef<any>(null);
  const { open } = useSlideOpen();

  const handleVehiclePress = useCallback(
    (id: string) => {
      open(<VehicleStockDetailScreen id={id} />, "Vehicle Details");
    },
    [open],
  );

  const columns = getVehicleStockColumns(handleVehiclePress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      setRowOffset((params.page - 1) * params.limit);
      dispatch(
        fetchVehicleStockInventory(buildTableApiParams(params, activeFilters)),
      );
    },
    [dispatch, activeFilters],
  );

  const previousFiltersJson = useRef<string | null>(null);
  useEffect(() => {
    const json = JSON.stringify(activeFilters);
    if (previousFiltersJson.current === null) {
      previousFiltersJson.current = json;
      return;
    }
    if (previousFiltersJson.current === json) {
      return;
    }
    previousFiltersJson.current = json;
    tableRef.current?.refresh();
  }, [activeFilters]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView
        onRefresh={() => tableRef.current?.refresh()}
        scrollEventThrottle={16}
        removeClippedSubviews
        decelerationRate="fast"
        nestedScrollEnabled
      >
        <TableMain
          ref={tableRef}
          columns={columns}
          data={inventory}
          totalItems={count}
          onFetchData={fetchData}
          enableSearch
          enablePagination
          enableColumnManagement
          enableSorting
          searchPlaceholder="Search vehicles..."
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50]}
          keyExtractor={(item: any) => item.id.toString()}
          emptyMessage="No vehicles found"
          isLoading={loading}
          defaultVisibleColumns={["id", "vehicle", "chassis_no"]}
          showCard
        />
      </ScreenScrollView>
      <AddFormButton component={<AddVehicleForm />} title="Add Vehicle" />
    </YStack>
  );
}
