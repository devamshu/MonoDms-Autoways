import { useSlideOpen } from "@/components/auth/slideOpen";
import { getDealerVehicleColumns } from "@/host/dms-warehouse/app/utils/columns/dealer-vehicle.columns";
import { useFilters } from "@/host/dms-warehouse/components/custom/filter/filterContext";
import { buildTableApiParams } from "@/host/dms-warehouse/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-warehouse/components/custom/table/main";

import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { fetchDealerVehicleInventory } from "@/host/dms-warehouse/app/features/dealer-vehicle/store/dealer-vehicle.thunks";
import { FetchParams } from "@/host/dms-warehouse/components/custom/table/types";
import { DealerVehicleDetailScreen } from "@/host/dms-warehouse/components/custom/viewDetail/dealerVehicleDetailScreen";
import { useCallback, useEffect, useRef } from "react";
import { YStack } from "tamagui";

export default function BranchInventoryScreen() {
  const dispatch = useAppDispatch();
  const { inventory, count, loading } = useAppSelector(
    (state) => state.warehouseDealerVehicle,
  );
  const { activeFilters } = useFilters();
  const tableRef = useRef<any>(null);
  const { open } = useSlideOpen();

  const handleVehiclePress = useCallback(
    (id: string) => {
      open(<DealerVehicleDetailScreen id={id} />, "Vehicle Details");
    },
    [open],
  );

  const columns = getDealerVehicleColumns(handleVehiclePress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      dispatch(
        fetchDealerVehicleInventory(buildTableApiParams(params, activeFilters)),
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
          searchPlaceholder="Search branch inventory..."
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50]}
          keyExtractor={(item: any) => item.id.toString()}
          emptyMessage="No vehicles found"
          isLoading={loading}
          defaultVisibleColumns={["id", "vehicle", "chassis_no"]}
          showCard
        />
      </ScreenScrollView>
    </YStack>
  );
}
