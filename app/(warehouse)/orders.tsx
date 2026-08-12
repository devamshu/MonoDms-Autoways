import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { fetchPartsOrders } from "@/host/dms-warehouse/app/features/orders/store/orders.thunks";
import { OrderPartsDetailScreen } from "@/host/dms-warehouse/app/order/order-parts";
import { getOrdersColumns } from "@/host/dms-warehouse/app/utils/columns/order.column";
import { buildTableApiParams } from "@/host/dms-warehouse/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-warehouse/components/custom/table/main";
import { FetchParams } from "@/host/dms-warehouse/components/custom/table/types";
import { useCallback, useRef, useState } from "react";
import { YStack } from "tamagui";

export default function OrdersScreen() {
  const dispatch = useAppDispatch();
  const { orders, count, loading } = useAppSelector(
    (state) => state.warehouseOrders,
  );
  const tableRef = useRef<any>(null);
  const ordersRef = useRef(orders);
  const { open } = useSlideOpen();
  const [rowOffset, setRowOffset] = useState(0);

  ordersRef.current = orders;

  const handleOrderPress = useCallback(
    (id: string) => {
      const order = ordersRef.current.find((o: any) => o.id === parseInt(id));
      const title = order ? `${order.order_no}` : "Order Details";

      open(<OrderPartsDetailScreen id={id} />, title);
    },
    [open],
  );

  const columns = getOrdersColumns(handleOrderPress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      setRowOffset((params.page - 1) * params.limit);
      dispatch(fetchPartsOrders(buildTableApiParams(params)));
    },
    [dispatch],
  );

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
          data={orders}
          totalItems={count}
          onFetchData={fetchData}
          enableSearch
          enablePagination
          enableColumnManagement
          enableSorting
          searchPlaceholder="Search by order number..."
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50]}
          keyExtractor={(item: any) =>
            item?.id != null ? item.id.toString() : `order_${item?.order_no}`
          }
          emptyMessage="No orders found"
          isLoading={loading}
          defaultVisibleColumns={["id", "order_no", "order_date"]}
          showCard
        />
      </ScreenScrollView>
    </YStack>
  );
}
