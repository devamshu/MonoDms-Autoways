import { useCallback, useMemo } from "react";
import { YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import {
  getFollowupColumns,
  transformFollowupRows,
} from "../../components/custom/columns/ccd.columns";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import { fetchFollowups } from "../features/ccd/store/ccd.thunks";

export function CCDFollowupScreen() {
  const dispatch = useAppDispatch();
  const { followups, followupsCount, followupsLoading } = useAppSelector(
    (state) => state.crmCcd,
  );

  const transformedData = useMemo(
    () => transformFollowupRows(followups),
    [followups],
  );

  const columns = useMemo(() => getFollowupColumns(), []);

  const handleFetchData = useCallback(
    async (params: FetchParams) => {
      await dispatch(
        fetchFollowups(
          buildTableApiParams(params, undefined, "-followup_date"),
        ),
      );
    },
    [dispatch],
  );

  return (
    <YStack flex={1}>
      <TableMain
        columns={columns}
        data={transformedData}
        totalItems={followupsCount}
        onFetchData={handleFetchData}
        isLoading={followupsLoading}
        emptyMessage="No followup data found"
        keyExtractor={(item) => item.id.toString()}
        searchPlaceholder="Search Inquiry Followup"
        itemsPerPage={10}
        itemsPerPageOptions={[10, 25, 50]}
        enableSearch
        enablePagination
        enableColumnManagement
        enableSorting
        showCard={false}
      />
    </YStack>
  );
}
