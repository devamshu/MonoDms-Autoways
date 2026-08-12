import { BitsImages } from "@/constants/bits";
import { CheckCheck } from "lucide-react-native";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { ScrollView, Text, useTheme, XStack, YStack } from "tamagui";
import { useAppDispatch } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import { GenericModal } from "../../components/custom/model/genericModal";
import { TableMain } from "../../components/custom/table/main";
import { Toast } from "../../../../components/auth/toast";
import {
  addPartInventoryLog,
  fetchPartsInventory,
} from "../features/parts/store/parts.thunks";
import { getLocationPartsColumns } from "../utils/columns/locationPart.column";
import { MethodSelectionDrawer } from "./drawer/method-selection-drawer";
import { PartEntryDrawer } from "./drawer/parts-entry-drawer";
import { QrScanPartsScreen } from "./qr-scan-parts";

interface LocationPart {
  id: string;
  partCode: string;
  name: string;
  quantity: number;
  sno: number;
}

interface LocationPartsScreenProps {
  stockyardId: number;
  stockyardName: string;
}

const stockEntry = BitsImages.success;

export function LocationPartsScreen({
  stockyardId,
}: LocationPartsScreenProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { open: openSlideDrawer, close } = useSlideOpen();

  const [parts, setParts] = useState<LocationPart[]>([]);
  const [methodDrawerOpen, setMethodDrawerOpen] = useState(false);
  const [partEntryDrawerOpen, setPartEntryDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [discardBackModalOpen, setDiscardBackModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBackgroundColor, setToastBackgroundColor] = useState("$green10");

  const showToastMessage = (message: string, isError = false) => {
    setToastMessage(message);
    setToastBackgroundColor(isError ? "$red10" : "$green10");
    setShowToast(true);
  };

  // Parts accumulate locally (same as the QR scan flow); nothing hits the
  // API until Confirm on the "Confirm Stock Entry" modal.
  const handleAddPart = (partCode: string, name: string, quantity: number) => {
    setParts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        partCode,
        name,
        quantity,
        sno: prev.length + 1,
      },
    ]);
    showToastMessage("Part added to list");
  };

  // Opening the scanner replaces this screen in the single-slot slide-open
  // panel, which would silently lose any unsaved manual entries — guard
  // with a Discard Changes prompt when there's something to lose.
  const openScanScreen = () => {
    openSlideDrawer(
      <QrScanPartsScreen stockyardId={stockyardId} />,
      "Scan Code",
    );
  };

  const handleConfirmDiscardBack = () => {
    setDiscardBackModalOpen(false);
    setParts([]);
    close();
  };

  const handleScanBarcode = () => {
    if (parts.length > 0) {
      setDiscardModalOpen(true);
    } else {
      openScanScreen();
    }
  };

  const handleConfirmDiscard = () => {
    setDiscardModalOpen(false);
    openScanScreen();
  };

  const handleSubmitClick = () => {
    if (parts.length === 0) {
      return;
    }
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const results = await Promise.allSettled(
      parts.map((part) =>
        dispatch(
          addPartInventoryLog({
            part_code: part.partCode,
            name: part.name,
            quantity: part.quantity,
            stockyard: stockyardId,
          }),
        ).unwrap(),
      ),
    );

    const total = parts.length;
    const failed: LocationPart[] = [];
    let succeededCount = 0;
    let firstFailureReason: string | undefined;
    let firstSuccessMessage: string | undefined;
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        succeededCount += 1;
        firstSuccessMessage ??= result.value.message;
      } else {
        failed.push(parts[index]);
        firstFailureReason ??= String(result.reason);
      }
    });

    setParts(failed);
    setConfirmModalOpen(false);
    setIsSubmitting(false);

    if (failed.length === 0) {
      dispatch(fetchPartsInventory({ page: 1, page_size: 10 }));
      showToastMessage(
        total === 1 && firstSuccessMessage
          ? firstSuccessMessage
          : "Parts added to inventory successfully",
      );
      close();
    } else if (succeededCount === 0 && total === 1) {
      showToastMessage(firstFailureReason || "Failed to add part to inventory", true);
    } else {
      showToastMessage(
        `${succeededCount} of ${total} parts added; ${failed.length} failed — retry when ready`,
        true,
      );
    }
  };

  const columns = getLocationPartsColumns();

  return (
    <YStack flex={1} backgroundColor={theme.background?.val}>
      <ScrollView flex={1}>
        <YStack padding="$4" gap="$4">
          {parts.length === 0 ? (
            <YStack
              height={300}
              alignItems="center"
              justifyContent="center"
              gap="$4"
            >
              <Text fontSize="$6" color={theme.secondaryText?.val}>
                No parts added yet
              </Text>
            </YStack>
          ) : (
            <>
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$6" fontWeight="600" color={theme.color?.val}>
                  Part List
                </Text>
                <TouchableOpacity
                  onPress={handleSubmitClick}
                  disabled={isSubmitting}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{ opacity: isSubmitting ? 0.5 : 1 }}
                >
                  <CheckCheck size={24} color={theme.primary?.val} />
                </TouchableOpacity>
              </XStack>
              <TableMain
                columns={columns}
                data={parts}
                totalItems={parts.length}
                onFetchData={async () => {}}
                enableSearch
                enablePagination
                enableColumnManagement={false}
                enableSorting
                searchPlaceholder="Search here..."
                itemsPerPage={5}
                itemsPerPageOptions={[5, 10, 25, 50]}
                keyExtractor={(item: any) => item.id}
                emptyMessage="No parts found"
                isLoading={false}
                defaultVisibleColumns={["sno", "partCode", "name", "quantity"]}
                showCard
              />
            </>
          )}
        </YStack>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setMethodDrawerOpen(true)}
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

      <MethodSelectionDrawer
        open={methodDrawerOpen}
        onOpenChange={setMethodDrawerOpen}
        onScanBarcode={handleScanBarcode}
        onEnterPartCode={() => {
          setMethodDrawerOpen(false);
          setPartEntryDrawerOpen(true);
        }}
      />

      <PartEntryDrawer
        open={partEntryDrawerOpen}
        onOpenChange={setPartEntryDrawerOpen}
        onPartAdd={handleAddPart}
      />

      <GenericModal
        isOpen={confirmModalOpen}
        variant="confirmCancel"
        title="Confirm Stock Entry"
        description="Please verify the details before adding to inventory."
        confirmText="Confirm"
        imageSource={stockEntry}
        cancelText="Cancel"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmModalOpen(false)}
        loading={isSubmitting}
      />

      <GenericModal
        isOpen={discardModalOpen}
        variant="discard"
        title="Discard Changes"
        description="You have unsaved changes. If you leave now, your updates will be lost."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardModalOpen(false)}
      />

      <GenericModal
        isOpen={discardBackModalOpen}
        variant="discard"
        title="Discard Changes"
        description="You have unsaved changes. If you leave now, your updates will be lost."
        confirmText="Discard"
        cancelText="Cancel"
        onConfirm={handleConfirmDiscardBack}
        onCancel={() => setDiscardBackModalOpen(false)}
        imageSource={BitsImages.discard}
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
