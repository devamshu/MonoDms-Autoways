import { Button } from "../../components/custom/buttons/button";
import QRScanner from "../../components/custom/scanner/customScanner";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import React, { useState } from "react";
import { Alert } from "react-native";
import { Card, H4, Paragraph, YStack, useTheme } from "tamagui";

interface ScanOrderScreenProps {
  onScanComplete?: (scannedData: string) => void;
}

const ScanOrderScreen = ({ onScanComplete }: ScanOrderScreenProps) => {
  const theme = useTheme();
  const { close } = useSlideOpen();
  const [paused, setPaused] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);

  const handleScan = (data: string) => {
    setPaused(true);
    setScannedValue(data);

    Alert.alert("Code Detected", `Order Part Data: ${data}`);

    // Call the callback with scanned data
    if (onScanComplete) {
      onScanComplete(data);
    }

    // Close the QR scanner drawer after short delay
    setTimeout(() => {
      close();
    }, 1500);
  };

  const handleScanAgain = () => {
    setScannedValue(null);
    setPaused(false);
  };

  return (
    <YStack flex={1} backgroundColor={theme.background?.val}>
      {/* QR Scanner */}
      <YStack flex={1}>
        <QRScanner
          isActive={!paused}
          onScan={handleScan}
          showFlashToggle
          showResetButton={false}
          scanBoxSize={280}
          borderColor={theme.primary?.val}
        />
      </YStack>

      {/* Result Card */}
      <Card
        elevation={5}
        margin="$4"
        padding="$4"
        backgroundColor={theme.backgroundStrong?.val}
        borderRadius="$4"
      >
        <YStack gap="$2">
          <H4 color={theme.color?.val}>Scan Result</H4>
          <Paragraph color={theme.secondaryText?.val}>
            {scannedValue ?? "Waiting for order part code..."}
          </Paragraph>
          <Button
            buttonVariant="primary"
            buttonText="Scan Again"
            onPress={handleScanAgain}
            disabled={!paused}
          />
        </YStack>
      </Card>
    </YStack>
  );
};

export default ScanOrderScreen;
