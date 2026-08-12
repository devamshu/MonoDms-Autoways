import { useCallback, useMemo } from "react";
import { YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import {
  applyServerColumnMeta,
  buildSearchPlaceholder,
  getCcdRetailColumns,
  transformRetailRows,
} from "../../components/custom/columns/ccd.columns";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import { fetchModuleCustomers } from "../features/ccd/store/ccd.thunks";
import { CCDRetailDetailScreen } from "./ViewDetail/retail-detail";

interface CCDRetailScreenProps {
  moduleId: number;
}

export function CCDRetailScreen({ moduleId }: CCDRetailScreenProps) {
  const dispatch = useAppDispatch();
  const { customers, moduleSettings, count, actionLoading } = useAppSelector(
    (state) => state.crmCcd,
  );
  const { open } = useSlideOpen();


  const handleOpenDetail = useCallback(
    (id: string) => {
      open(<CCDRetailDetailScreen id={id} />, "Sales Details");
    },
    [open],
  );

  // Handle row press - open slide with detail
  const handleRowPress = useCallback(
    (row: any) => handleOpenDetail((row.sales_id || row.id).toString()),
    [handleOpenDetail],
  );

  // Transform data for retail - extract from actual API response
  const transformedData = useMemo(
    () => transformRetailRows(customers),
    [customers],
  );

  // Retail specific columns based on actual API data. Sort flags and ordering
  // keys come from the server: several of these columns are assembled in the
  // transform above and have no field the API can order on.
  const columns = useMemo(
    () =>
      applyServerColumnMeta(
        getCcdRetailColumns(handleOpenDetail),
        moduleSettings?.table_columns,
      ),
    [handleOpenDetail, moduleSettings],
  );

  const defaultOrdering = moduleSettings?.metadata?.default_sort;

  const handleFetchData = useCallback(
    async (params: FetchParams) => {
      await dispatch(
        fetchModuleCustomers({
          moduleId,
          params: buildTableApiParams(params, undefined, defaultOrdering),
        }),
      );
    },
    [dispatch, moduleId, defaultOrdering],
  );

  return (
    <YStack flex={1}>
      <TableMain
        key={moduleId}
        columns={columns}
        data={transformedData}
        totalItems={count}
        onFetchData={handleFetchData}
        isLoading={actionLoading}
        emptyMessage="No retail data found"
        keyExtractor={(item) =>
          item.sales_id?.toString() || item.id?.toString()
        }
        onRowPress={handleRowPress}
        searchPlaceholder={"Search CCD Retail"}
        itemsPerPage={5}
        itemsPerPageOptions={[5, 10, 25, 50]}
        enableSearch
        enablePagination
        enableColumnManagement
        enableSorting
        showCard={false}
      />
    </YStack>
  );
}
