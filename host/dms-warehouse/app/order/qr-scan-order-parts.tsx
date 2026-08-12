import { CheckCheck } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { ScrollView, Text, useTheme, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { Toast } from "../../../../components/auth/toast";
import {
  fetchPartsOrders,
  updateOrderParts,
} from "../../app/features/orders/store/orders.thunks";
import {
  OrderItem,
  OrderItemPayload,
  SparePartDetails,
} from "../../app/features/orders/types";
import { getOrderPartsColumns } from "../../app/utils/columns/orderPart.column";
import { GenericModal } from "../../components/custom/model/genericModal";
import QRScanner from "../../components/custom/scanner/customScanner";
import { DEFAULT_TABLE_ORDERING } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";

interface QrScanOrderPartsScreenProps {
  orderId: string;
}

interface ScannedEntry {
  quantity: number;
  sparepart_details?: SparePartDetails;
}

function buildRow(sparepartId: number, entry: ScannedEntry): OrderItem {
  return {
    id: sparepartId,
    sparepart: sparepartId,
    sparepart_details: entry.sparepart_details ?? {
      id: sparepartId,
      name: `Part ${sparepartId}`,
      part_code: String(sparepartId),
    },
    ordered_quantity: entry.quantity,
    received_quantity: 0,
    excess_quantity: 0,
    damage_quantity: 0,
    short_quantity: 0,
    backlog_quantity: 0,
    rate: null,
    amount: null,
    cancel_status: 0,
    cancel_reason: null,
    received_order_details: null,
  };
}

export function QrScanOrderPartsScreen({
  orderId,
}: QrScanOrderPartsScreenProps) {
  const theme = useTheme();
  const { orders } = useAppSelector((state) => state.warehouseOrders);
  const order = orders.find((o) => o.id === parseInt(orderId, 10));

  const [scannedParts, setScannedParts] = useState<
    Record<number, ScannedEntry>
  >({});
  const [step, setStep] = useState<"scan" | "review">("scan");

  const dispatch = useAppDispatch();
  const { close, setHeaderRight, setBeforeBack } = useSlideOpen();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBackgroundColor, setToastBackgroundColor] = useState("$green10");

  const showToastMessage = (message: string, isError = false) => {
    setToastMessage(message);
    setToastBackgroundColor(isError ? "$red10" : "$green10");
    setShowToast(true);
  };

  const handleCheckPress = useCallback(() => {
    if (Object.keys(scannedParts).length === 0) {
      showToastMessage("Scan at least one part first", true);
      return;
    }
    setConfirmModalOpen(true);
  }, [scannedParts]);

  useEffect(() => {
    if (step !== "review") {
      setHeaderRight(null);
      return;
    }

    setHeaderRight(
      <TouchableOpacity
        onPress={handleCheckPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <CheckCheck size={24} color="#fff" />
      </TouchableOpacity>,
    );

    return () => setHeaderRight(null);
  }, [step, handleCheckPress, setHeaderRight]);

  // Intercept the header back-arrow: if there's scanned progress that
  // hasn't been submitted yet, confirm before discarding it instead of
  // navigating straight back to the previous page.
  const pendingBackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setBeforeBack((proceed) => {
      if (Object.keys(scannedParts).length === 0) {
        proceed();
        return;
      }
      pendingBackRef.current = proceed;
      setDiscardModalOpen(true);
    });

    return () => setBeforeBack(null);
  }, [scannedParts, setBeforeBack]);

  const handleDiscardBack = () => {
    setDiscardModalOpen(false);
    pendingBackRef.current?.();
    pendingBackRef.current = null;
  };

  const handleScan = (data: string) => {
    // Barcode format: "<sparepart id>" or "<sparepart id>|<name>". The name
    // is only a fallback label for parts that aren't already on this order —
    // if the id matches an existing order_item, that item's real
    // sparepart_details always takes precedence over the scanned name.
    const [idPart, namePart] = data.split("|");
    const sparepartId = parseInt(idPart, 10);
    if (isNaN(sparepartId)) return;

    const scannedName = namePart?.trim();

    setScannedParts((prev) => {
      const existing = prev[sparepartId];
      const requiredMatch = order?.order_items.find(
        (item) => item.sparepart === sparepartId,
      );

      return {
        ...prev,
        [sparepartId]: {
          quantity: (existing?.quantity ?? 0) + 1,
          sparepart_details:
            existing?.sparepart_details ??
            requiredMatch?.sparepart_details ??
            (scannedName
              ? {
                  id: sparepartId,
                  name: scannedName,
                  part_code: String(sparepartId),
                }
              : undefined),
        },
      };
    });

    setStep("review");
  };

  // The scanner's own close (X) button: if there's already scanned progress
  // (the user came back to scan more from the review page), go back to the
  // review page instead of discarding it; only exit the whole flow if
  // nothing has been scanned yet.
  const handleScannerClose = () => {
    if (Object.keys(scannedParts).length > 0) {
      setStep("review");
    } else {
      close();
    }
  };

  const rows = useMemo(
    () =>
      Object.entries(scannedParts).map(([sparepartId, entry]) =>
        buildRow(Number(sparepartId), entry),
      ),
    [scannedParts],
  );

  // TableMain calls onFetchData for search/pagination/sorting, expecting the
  // caller to re-fetch from a server. There's no server here — everything
  // scanned already lives in local state — so search is just a client-side
  // filter over `rows`, scoped to this screen only.
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) => {
      const details = row.sparepart_details;
      return (
        details?.name?.toLowerCase().includes(term) ||
        details?.part_code?.toLowerCase().includes(term) ||
        String(row.sparepart).includes(term)
      );
    });
  }, [rows, searchTerm]);

  const missingRequiredParts = (order?.order_items ?? []).filter(
    (item) => !(item.sparepart in scannedParts),
  );
  const isComplete = missingRequiredParts.length === 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const order_items: OrderItemPayload[] = Object.entries(scannedParts).map(
        ([sparepartId, entry]) => ({
          sparepart: Number(sparepartId),
          ordered_quantity: entry.quantity,
        }),
      );

      await dispatch(
        updateOrderParts({
          orderId: parseInt(orderId, 10),
          payload: { order_items },
        }),
      ).unwrap();

      await dispatch(fetchPartsOrders({ ordering: DEFAULT_TABLE_ORDERING }));

      setConfirmModalOpen(false);
      showToastMessage("Parts request submitted successfully");
      close();
    } catch (error) {
      setConfirmModalOpen(false);
      showToastMessage(error as string, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = getOrderPartsColumns(() => {});

  return (
    <YStack flex={1} backgroundColor={theme.background?.val}>
      {step === "scan" ? (
        <YStack flex={1}>
          <QRScanner
            isActive
            onScan={handleScan}
            onClose={handleScannerClose}
            showFlashToggle
            showResetButton={false}
            scanBoxSize={220}
            borderColor={theme.primary?.val}
          />
        </YStack>
      ) : (
        <>
          <ScrollView flex={1}>
            <YStack padding="$4">
              <TableMain
                columns={columns}
                data={filteredRows}
                totalItems={filteredRows.length}
                onFetchData={async (params) => {
                  setSearchTerm(params.search ?? "");
                }}
                enableSearch
                enablePagination
                enableColumnManagement={false}
                enableSorting={false}
                itemsPerPage={5}
                itemsPerPageOptions={[5, 10, 25, 50]}
                keyExtractor={(item: any) => item.id.toString()}
                emptyMessage="Scan a part to add it here"
                isLoading={false}
                defaultVisibleColumns={[
                  "id",
                  "part_code",
                  "part_name",
                  "ordered_quantity",
                ]}
                showCard
              />
            </YStack>
          </ScrollView>

          <TouchableOpacity
            onPress={() => setStep("scan")}
            style={{
              position: "absolute",
              bottom: 24,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.primary?.val,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text fontSize={28} color={theme.background?.val}>
              +
            </Text>
          </TouchableOpacity>
        </>
      )}

      <GenericModal
        isOpen={confirmModalOpen}
        variant="confirmCancel"
        title={
          isComplete ? "Complete Parts Request" : "Incomplete Parts Request"
        }
        description={
          isComplete
            ? "All required parts are scanned. Do you want to complete this request?"
            : "Some required parts are not scanned. Do you want to proceed anyway?"
        }
        confirmText="Proceed"
        cancelText="Cancel"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmModalOpen(false)}
        loading={isSubmitting}
      />

      <GenericModal
        isOpen={discardModalOpen}
        variant="discard"
        title="Discard Changes"
        description="You have scanned parts that haven't been submitted. If you leave now, this progress will be lost."
        cancelText="Cancel"
        confirmText="Discard"
        onCancel={() => {
          setDiscardModalOpen(false);
          pendingBackRef.current = null;
        }}
        onConfirm={handleDiscardBack}
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
