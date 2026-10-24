import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { fetchPartsInventory } from "@/host/dms-warehouse/app/features/parts/store/parts.thunks";
import { StockyardSelectionDrawer } from "@/host/dms-warehouse/app/parts/drawer/stockyard-selection-drawer";
import { LocationPartsScreen } from "@/host/dms-warehouse/app/parts/location-parts";
import { getPartsColumns } from "@/host/dms-warehouse/app/utils/columns/part.column";
import { AddFormButton } from "@/host/dms-warehouse/components/custom/buttons/addFormButton";
import { useFilters } from "@/host/dms-warehouse/components/custom/filter/filterContext";
import { buildTableApiParams } from "@/host/dms-warehouse/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-warehouse/components/custom/table/main";
import { FetchParams } from "@/host/dms-warehouse/components/custom/table/types";
import { PartsDetailScreen } from "@/host/dms-warehouse/components/custom/viewDetail/partsDetailScreen";
import { useCallback, useEffect, useRef, useState } from "react";
import { YStack } from "tamagui";

export default function PartsScreen() {
  const dispatch = useAppDispatch();
  const { inventory, count, loading } = useAppSelector(
    (state) => state.warehousePartStock,
  );
  const { activeFilters } = useFilters();
  const tableRef = useRef<any>(null);
  const { open } = useSlideOpen();
  const [stockyardDrawerOpen, setStockyardDrawerOpen] = useState(false);
  const [rowOffset, setRowOffset] = useState(0);

  const handlePartPress = useCallback(
    (id: string) => {
      open(<PartsDetailScreen id={id} />, "Part Details");
    },
    [open],
  );

  const columns = getPartsColumns(handlePartPress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      setRowOffset((params.page - 1) * params.limit);
      dispatch(fetchPartsInventory(buildTableApiParams(params, activeFilters)));
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

  const handleStockyardSelect = (
    stockyardId: number,
    stockyardName: string,
  ) => {
    open(
      <LocationPartsScreen
        stockyardId={stockyardId}
        stockyardName={stockyardName}
      />,
      stockyardName,
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView onRefresh={() => tableRef.current?.refresh()}>
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
          searchPlaceholder="Search parts..."
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50]}
          keyExtractor={(item: any) => item.id.toString()}
          emptyMessage="No parts found"
          isLoading={loading}
          defaultVisibleColumns={["id", "part_code", "name", "quantity"]}
          showCard
        />
      </ScreenScrollView>

      {/* <AddFormButton
        component={null}
        onPress={() => setStockyardDrawerOpen(true)}
      /> */}

      <StockyardSelectionDrawer
        open={stockyardDrawerOpen}
        onOpenChange={setStockyardDrawerOpen}
        onStockyardSelect={handleStockyardSelect}
      />
    </YStack>
  );
}
