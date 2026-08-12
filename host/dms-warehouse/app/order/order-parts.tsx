import { useCallback, useRef, useState } from "react";
import { useTheme, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { Toast } from "../../../../components/auth/toast";
import { ScreenScrollView } from "../../../../components/workspace/screen-scroll-view";
import {
  fetchPartsOrders,
  updateOrderParts,
} from "../../app/features/orders/store/orders.thunks";
import { getOrderPartsColumns } from "../../app/utils/columns/orderPart.column";
import { AddFormButton } from "../../components/custom/buttons/addFormButton";
import { DEFAULT_TABLE_ORDERING } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { OrderPartsIndividualDetailScreen } from "../../components/custom/viewDetail/orderPartIndividualDetailScreen";
import { OrderMethodSelectionDrawer } from "./drawer/order-method-drawer";
import { OrderPartEntryDrawer } from "./drawer/order-part-entry-drawer";

interface OrderPartsDetailScreenProps {
  id: string;
}

export function OrderPartsDetailScreen({ id }: OrderPartsDetailScreenProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.warehouseOrders);
  const order = orders.find((o) => o.id === parseInt(id));
  const tableRef = useRef<any>(null);
  const idRef = useRef(id);
  const { open } = useSlideOpen();
  const [methodDrawerOpen, setMethodDrawerOpen] = useState(false);
  const [partEntryDrawerOpen, setPartEntryDrawerOpen] = useState(false);
  const [scannedPartCode, setScannedPartCode] = useState<string>("");
  const [isPartCodeReadOnly, setIsPartCodeReadOnly] = useState(false);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBackgroundColor, setToastBackgroundColor] = useState("$green10");

  idRef.current = id;

  const showToastMessage = (message: string, isError = false) => {
    setToastMessage(message);
    setToastBackgroundColor(isError ? "$red10" : "$green10");
    setShowToast(true);
  };

  const handlePartPress = useCallback(
    (partId: string) => {
      // push: true — stacks on top of this screen instead of replacing it,
      // so closing the detail view returns here rather than all the way
      // back to the orders list.
      open(
        <OrderPartsIndividualDetailScreen id={partId} orderId={idRef.current} />,
        "Part Details",
        { push: true },
      );
    },
    [open],
  );

  const columns = getOrderPartsColumns(handlePartPress);

  const addPartToOrder = async (partCode: string, quantity: number) => {
    setIsAddingPart(true);
    try {
      const payload = {
        order_items: [
          {
            sparepart: parseInt(partCode),
            ordered_quantity: quantity,
          },
        ],
      };

      await dispatch(
        updateOrderParts({ orderId: parseInt(id), payload }),
      ).unwrap();
      await dispatch(fetchPartsOrders({ ordering: DEFAULT_TABLE_ORDERING }));

      showToastMessage("Part added successfully");
    } catch (error) {
      showToastMessage(error as string, true);
    } finally {
      setIsAddingPart(false);
    }
  };

  const handleManualAddPart = (partCode: string, quantity: number) => {
    addPartToOrder(partCode, quantity);
  };

  const handleScanBarcode = () => {};

  const handleEnterPartCode = () => {
    setScannedPartCode("");
    setIsPartCodeReadOnly(false);
    setPartEntryDrawerOpen(true);
  };

  const orderItems = order?.order_items || [];

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView
        onRefresh={() => tableRef.current?.refresh()}
        scrollEventThrottle={16}
        removeClippedSubviews
        decelerationRate="fast"
        nestedScrollEnabled
      >
        <YStack padding="$4">
          <TableMain
            ref={tableRef}
            columns={columns}
            data={orderItems}
            totalItems={orderItems.length}
            onFetchData={async () => {}}
            enableSearch
            enablePagination
            enableColumnManagement={false}
            enableSorting
            searchPlaceholder="Search parts..."
            itemsPerPage={5}
            itemsPerPageOptions={[5, 10, 25, 50]}
            keyExtractor={(item: any) => item.id.toString()}
            emptyMessage="No parts found for this order"
            isLoading={false}
            defaultVisibleColumns={[
              "id",
              "part_code",
              "part_name",
              "ordered_quantity",
              "received_quantity",
            ]}
            showCard
          />
        </YStack>
      </ScreenScrollView>

      <AddFormButton
        component={null}
        onPress={() => setMethodDrawerOpen(true)}
      />

      <OrderMethodSelectionDrawer
        open={methodDrawerOpen}
        onOpenChange={setMethodDrawerOpen}
        onScanBarcode={handleScanBarcode}
        onEnterPartCode={handleEnterPartCode}
        orderId={id}
        orderNo={order?.order_no}
      />

      <OrderPartEntryDrawer
        open={partEntryDrawerOpen}
        onOpenChange={setPartEntryDrawerOpen}
        onPartAdd={handleManualAddPart}
        initialPartCode={scannedPartCode}
        isPartCodeReadOnly={isPartCodeReadOnly}
        isLoading={isAddingPart}
      />

      <Toast
        show={showToast}
        message={toastMessage}
        backgroundColor={toastBackgroundColor}
        onDismiss={() => setShowToast(false)}
      />
    </YStack>
  );
}
