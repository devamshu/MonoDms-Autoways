import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { FetchParams } from "../../components/custom/table/types";
import { fetchPartsOrders } from "../features/orders/store/orders.thunks";
import { OrderPartsDetailScreen } from "../order/order-parts";
import { getOrdersColumns } from "../utils/columns/order.column";
import { AppRoutes } from "../utils/navigation";

export default function HomeOrdersTable() {
  const dispatch = useAppDispatch();
  const { orders, count, loading } = useAppSelector(
    (state) => state.warehouseOrders,
  );
  const tableRef = useRef<any>(null);
  const ordersRef = useRef(orders);
  const { open } = useSlideOpen();

  ordersRef.current = orders;

  const handleOrderPress = useCallback(
    (id: string) => {
      const order = ordersRef.current.find((o) => o.id === parseInt(id));
      const title = order ? `${order.order_no}` : "Order Details";

      open(<OrderPartsDetailScreen id={id} />, title);
    },
    [open],
  );

  const columns = getOrdersColumns(handleOrderPress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      dispatch(fetchPartsOrders(buildTableApiParams(params)));
    },
    [dispatch],
  );

  const handleViewAll = () => {
    router.push(AppRoutes.ORDER_SCREEN);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <YStack marginTop="$4" gap="$4" flex={1} paddingBottom="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="700" color="$color">
            Recent Order
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
          data={orders.slice(0, 2)}
          totalItems={count}
          onFetchData={fetchData}
          enableSearch
          enablePagination={false}
          enableColumnManagement
          enableSorting
          searchPlaceholder="Search by order number..."
          keyExtractor={(item: any) =>
            item?.id != null ? item.id.toString() : `order_${item?.order_no}`
          }
          emptyMessage="No orders found"
          isLoading={loading}
          defaultVisibleColumns={["id", "order_no", "order_date"]}
          showCard
        />
      </YStack>
    </KeyboardAvoidingView>
  );
}
