import { useCallback, useMemo } from "react";
import { YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import {
  applyServerColumnMeta,
  buildSearchPlaceholder,
  getCcdPsfColumns,
  transformPsfRows,
} from "../../components/custom/columns/ccd.columns";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import { fetchModuleCustomers } from "../features/ccd/store/ccd.thunks";
import { CCDPsfDetailScreen } from "./ViewDetail/psf-detail";

interface CCDPsfScreenProps {
  moduleId: number;
}

export function CCDPsfScreen({ moduleId }: CCDPsfScreenProps) {
  const dispatch = useAppDispatch();
  const { customers, moduleSettings, count, actionLoading } = useAppSelector(
    (state) => state.crmCcd,
  );
  const { open } = useSlideOpen();

  const handleOpenDetail = useCallback(
    (id: string) => {
      open(<CCDPsfDetailScreen id={id} />, "Job Card Details");
    },
    [open],
  );

  // Handle row press - open slide with detail
  const handleRowPress = useCallback(
    (row: any) => handleOpenDetail(row.id.toString()),
    [handleOpenDetail],
  );

  // Transform data for PSF
  const transformedData = useMemo(
    () => transformPsfRows(customers),
    [customers],
  );

  // PSF specific columns. Sort flags and ordering keys come from the server:
  // `customer_name` is assembled in the transform above and has no field the
  // API can order on.
  const columns = useMemo(
    () =>
      applyServerColumnMeta(
        getCcdPsfColumns(handleOpenDetail),
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
        emptyMessage="No PSF data found"
        keyExtractor={(item) => item.id.toString()}
        onRowPress={handleRowPress}
        searchPlaceholder={"Search CCD Psf"}
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
