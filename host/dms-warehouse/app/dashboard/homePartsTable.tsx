import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import {
  buildTableApiParams,
  DEFAULT_TABLE_ORDERING,
} from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import { PartsDetailScreen } from "../../components/custom/viewDetail/partsDetailScreen";
import { fetchPartsInventory } from "../features/parts/store/parts.thunks";
import { getPartsColumns } from "../utils/columns/part.column";
import { AppRoutes } from "../utils/navigation";

export function HomePartsTable() {
  const dispatch = useAppDispatch();
  const { inventory, count, loading, initialLoadDone } = useAppSelector(
    (state) => state.warehousePartStock,
  );
  const { open } = useSlideOpen();
  const tableRef = useRef<any>(null);

  const handlePartPress = useCallback(
    (id: string) => {
      open(<PartsDetailScreen id={id} />, "Part Details");
    },
    [open],
  );

  const columns = useMemo(
    () => getPartsColumns(handlePartPress),
    [handlePartPress],
  );

  // Initial load only - runs once
  useEffect(() => {
    if (!initialLoadDone && !loading) {
      dispatch(
        fetchPartsInventory({
          page: 1,
          page_size: 5,
          search: "",
          ordering: DEFAULT_TABLE_ORDERING,
        }),
      );
    }
  }, [dispatch, initialLoadDone, loading]);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      dispatch(fetchPartsInventory(buildTableApiParams(params)));
    },
    [dispatch],
  );

  const handleViewAll = () => {
    router.push(AppRoutes.PARTS_SCREEN);
  };

  return (
    <YStack marginTop="$4" gap="$4" flex={1} paddingBottom="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="700" color="$color">
          Recent Parts
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
        enableSorting={false}
        searchPlaceholder="Search parts..."
        isLoading={loading}
        defaultVisibleColumns={["id", "part_code", "name"]}
        showCard
        emptyMessage="No parts found"
        keyExtractor={(item: any) => item.id.toString()}
      />
    </YStack>
  );
}
