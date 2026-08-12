import { CheckCheck } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { ScrollView, Text, useTheme, YStack } from "tamagui";
import { useAppDispatch } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { Toast } from "../../../../components/auth/toast";
import {
  addPartInventoryLog,
  fetchPartsInventory,
} from "../../app/features/parts/store/parts.thunks";
import { GenericModal } from "../../components/custom/model/genericModal";
import QRScanner from "../../components/custom/scanner/customScanner";
import { TableMain } from "../../components/custom/table/main";
import { getLocationPartsColumns } from "../utils/columns/locationPart.column";

interface QrScanPartsScreenProps {
  stockyardId: number;
}

interface ScannedEntry {
  quantity: number;
  name?: string;
}

interface ScannedRow {
  id: string;
  partCode: string;
  name?: string;
  quantity: number;
  sno: number;
}

function buildRow(
  sparepartId: number,
  entry: ScannedEntry,
  index: number,
): ScannedRow {
  return {
    id: String(sparepartId),
    partCode: String(sparepartId),
    name: entry.name,
    quantity: entry.quantity,
    sno: index + 1,
  };
}

export function QrScanPartsScreen({ stockyardId }: QrScanPartsScreenProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { close, setHeaderRight, setBeforeBack } = useSlideOpen();

  const [scannedParts, setScannedParts] = useState<
    Record<number, ScannedEntry>
  >({});
  const [step, setStep] = useState<"scan" | "review">("scan");

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
    // Barcode format: "<sparepart id>" or "<sparepart id>|<name>", same
    // convention as the Orders QR-scan flow.
    const [idPart, namePart] = data.split("|");
    const sparepartId = parseInt(idPart, 10);
    if (isNaN(sparepartId)) return;

    const scannedName = namePart?.trim();

    setScannedParts((prev) => {
      const existing = prev[sparepartId];
      return {
        ...prev,
        [sparepartId]: {
          quantity: (existing?.quantity ?? 0) + 1,
          name: existing?.name ?? scannedName,
        },
      };
    });

    setStep("review");
  };

  // Mirrors the Orders scan screen: if there's already scanned progress,
  // the scanner's own close button returns to the review table instead of
  // leaving the whole flow.
  const handleScannerClose = () => {
    if (Object.keys(scannedParts).length > 0) {
      setStep("review");
    } else {
      close();
    }
  };

  const rows = useMemo(
    () =>
      Object.entries(scannedParts).map(([sparepartId, entry], index) =>
        buildRow(Number(sparepartId), entry, index),
      ),
    [scannedParts],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const entries = Object.entries(scannedParts);

    const results = await Promise.allSettled(
      entries.map(([sparepartId, entry]) => {
        const payload = {
          part_code: sparepartId,
          name: entry.name || sparepartId,
          quantity: entry.quantity,
          stockyard: stockyardId,
        };
        return dispatch(addPartInventoryLog(payload)).unwrap();
      }),
    );

    const failed: Record<number, ScannedEntry> = {};
    let succeededCount = 0;
    let firstFailureReason: string | undefined;
    results.forEach((result, index) => {
      const [sparepartId, entry] = entries[index];
      if (result.status === "fulfilled") {
        succeededCount += 1;
      } else {
        failed[Number(sparepartId)] = entry;
        firstFailureReason ??= String(result.reason);
      }
    });

    setScannedParts(failed);
    setConfirmModalOpen(false);
    setIsSubmitting(false);

    const failedCount = Object.keys(failed).length;
    if (failedCount === 0) {
      dispatch(fetchPartsInventory({ page: 1, page_size: 10 }));
      showToastMessage(
        entries.length === 1
          ? "Part added to inventory successfully"
          : "Parts added to inventory successfully",
      );
      close();
    } else if (succeededCount === 0 && entries.length === 1) {
      showToastMessage(
        firstFailureReason || "Failed to add part to inventory",
        true,
      );
    } else {
      showToastMessage(
        `${succeededCount} of ${entries.length} parts added; ${failedCount} failed — retry when ready`,
        true,
      );
    }
  };

  const columns = getLocationPartsColumns();

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
                data={rows}
                totalItems={rows.length}
                onFetchData={async () => {}}
                enableSearch
                enablePagination
                enableColumnManagement={false}
                enableSorting={false}
                itemsPerPage={5}
                itemsPerPageOptions={[5, 10, 25, 50]}
                keyExtractor={(item: any) => item.id}
                emptyMessage="Scan a part to add it here"
                isLoading={false}
                defaultVisibleColumns={["sno", "partCode", "name", "quantity"]}
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
        title="Confirm Stock Entry"
        description="Please verify the details before adding to inventory."
        confirmText="Confirm"
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
