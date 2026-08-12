import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { DiscountDetailScreen } from "@/host/dms-crm/app/discount/viewDetail/DiscountDetailScreen";
import { fetchDiscounts } from "@/host/dms-crm/app/features/discount/store/discount.thunks";
import { getDiscountColumns } from "@/host/dms-crm/components/custom/columns/discount.columns";
import { useFilters } from "@/host/dms-crm/components/custom/filter/filterContext";
import { buildTableApiParams } from "@/host/dms-crm/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-crm/components/custom/table/main";
import { FetchParams } from "@/host/dms-crm/components/custom/table/types";
import { useCallback, useRef } from "react";
import { YStack } from "tamagui";

export default function DiscountScreen() {
  const dispatch = useAppDispatch();
  const { discounts, count, loading } = useAppSelector(
    (state) => state.crmDiscount,
  );
  const { open } = useSlideOpen();
  const tableRef = useRef<any>(null);

  const { activeFilters } = useFilters();

  const handleDiscountPress = useCallback(
    (id: string) => {
      open(<DiscountDetailScreen id={id} />, "Discount Details");
    },
    [open],
  );

  const columns = getDiscountColumns(handleDiscountPress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      dispatch(fetchDiscounts(buildTableApiParams(params, activeFilters)));
    },
    [dispatch, activeFilters],
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView onRefresh={() => tableRef.current?.refresh()}>
        <TableMain
          ref={tableRef}
          columns={columns}
          data={discounts}
          totalItems={count}
          onFetchData={fetchData}
          enableSearch
          enablePagination
          enableColumnManagement
          enableSorting
          searchPlaceholder="Search discounts..."
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50]}
          keyExtractor={(item) => item.id.toString()}
          emptyMessage="No discount requests found"
          isLoading={loading}
          defaultVisibleColumns={[
            "id",
            "is_approved",
            "inquiry",
            "requested_discount_amount",
            "is_approved",
            "vehicle_name",
          ]}
          showCard
        />
      </ScreenScrollView>
    </YStack>
  );
}
