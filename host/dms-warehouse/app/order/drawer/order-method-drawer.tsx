import { BottomDrawer } from "../../../components/custom/drawer";
import { useSlideOpen } from "../../../../../components/auth/slideOpen";
import { ScanBarcode, Wrench } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { Text, XStack, YStack, useTheme } from "tamagui";
import { QrScanOrderPartsScreen } from "../../../app/order/qr-scan-order-parts";

interface OrderMethodSelectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanBarcode: () => void;
  onEnterPartCode: () => void;
  orderId: string;
  orderNo?: string;
}

export function OrderMethodSelectionDrawer({
  open,
  onOpenChange,
  onScanBarcode,
  onEnterPartCode,
  orderId,
  orderNo,
}: OrderMethodSelectionDrawerProps) {
  const theme = useTheme();
  const { open: openSlideDrawer } = useSlideOpen();

  const handleScanBarcode = () => {
    onScanBarcode();
    onOpenChange(false); // Close this bottom drawer

    // Open the parts-request QR scan screen in a new slide drawer
    openSlideDrawer(
      <QrScanOrderPartsScreen orderId={orderId} />,
      orderNo || "Scan Parts",
    );
  };

  const handleEnterPartCode = () => {
    onEnterPartCode();
    onOpenChange(false);
  };

  return (
    <BottomDrawer
      open={open}
      onOpenChange={onOpenChange}
      headerTitle="Add Part"
      height={25}
    >
      <YStack gap="$0">
        <TouchableOpacity
          onPress={handleScanBarcode}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
            height: 60,
            backgroundColor: theme.background?.val,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor?.val,
          }}
        >
          <XStack gap="$3" alignItems="center">
            <ScanBarcode size={24} color={theme.color?.val} />
            <Text fontSize="$4" fontWeight="500" color={theme.color?.val}>
              Scan Bar Code
            </Text>
          </XStack>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEnterPartCode}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 16,
            height: 60,
            backgroundColor: theme.background?.val,
          }}
        >
          <XStack gap="$3" alignItems="center">
            <Wrench size={24} color={theme.color?.val} />
            <Text fontSize="$4" fontWeight="500" color={theme.color?.val}>
              Enter Part Code
            </Text>
          </XStack>
        </TouchableOpacity>
      </YStack>
    </BottomDrawer>
  );
}
