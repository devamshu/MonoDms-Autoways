import { ScreenScrollView } from "../../../../components/workspace/screen-scroll-view";
import { getUsersColumns } from "../../components/custom/columns/user.column";
import { useFilters } from "../../components/custom/filter/filterContext";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import { useCallback, useEffect, useRef } from "react";
import { YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { fetchUsers } from "../features/users/store/users.thunk";
import { UserDetailScreen } from "./ViewDetail/UserDetailScreen";

export default function UsersScreen() {
  const dispatch = useAppDispatch();
  const { users, count, loading } = useAppSelector((state) => state.managementUsers);
  const { activeFilters } = useFilters();
  const tableRef = useRef<any>(null);
  const { open } = useSlideOpen();

  const handleUserPress = useCallback(
    (id: string) => {
      open(<UserDetailScreen id={id} />, "User Details");
    },
    [open],
  );

  const columns = getUsersColumns(handleUserPress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      dispatch(fetchUsers(buildTableApiParams(params, activeFilters)));
    },
    [dispatch, activeFilters],
  );

  // TableMain holds onFetchData in a ref, so a new activeFilters identity does
  // not retrigger its fetch effect — refresh explicitly instead. Skips the
  // first run so it doesn't double-fetch alongside TableMain's initial fetch.
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
      <ScreenScrollView onRefresh={() => tableRef.current?.refresh()}>
        <TableMain
          ref={tableRef}
          columns={columns}
          data={users}
          totalItems={count}
          onFetchData={fetchData}
          enableSearch
          enablePagination
          enableColumnManagement
          enableSorting
          searchPlaceholder="Search users..."
          itemsPerPage={5}
          itemsPerPageOptions={[5, 10, 25]}
          keyExtractor={(item) => item.id.toString()}
          emptyMessage="No users found"
          isLoading={loading}
          defaultVisibleColumns={[
            "id",
            "username",
            "email",
            "is_staff",
            "is_active",
          ]}
          showCard
        />
      </ScreenScrollView>
    </YStack>
  );
}
