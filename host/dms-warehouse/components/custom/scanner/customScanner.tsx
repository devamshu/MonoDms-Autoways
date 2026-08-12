import { CameraView } from "expo-camera";
import { router } from "expo-router";
import { RotateCcw, X, Zap, ZapOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, XStack } from "tamagui";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface QRScannerProps {
  onScan: (data: string) => void;
  onClose?: () => void;
  scanDelay?: number;
  showFlashToggle?: boolean;
  showResetButton?: boolean;
  isActive?: boolean;
  overlayColor?: string;
  borderColor?: string;
  lineColor?: string;
  scanBoxSize?: number;
}

const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  scanDelay = 2000,
  showFlashToggle = true,
  showResetButton = true,
  isActive = true,
  overlayColor = "rgba(0,0,0,0.7)",
  borderColor = "#117E2A",
  lineColor = "#F97316",
  scanBoxSize = 280,
}) => {
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startScanLineAnimation();
  }, []);

  const startScanLineAnimation = () => {
    scanLineAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: scanBoxSize - 20,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const resetScanner = () => {
    setScanned(false);
  };

  const handleScan = ({ data }: { data: string }) => {
    if (scanned || !isActive) return;

    setScanned(true);
    onScan(data);

    if (scanDelay > 0) {
      setTimeout(resetScanner, scanDelay);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {isActive && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "upc_a",
              "upc_e",
              "code128",
              "code39",
              "code93",
              "codabar",
              "itf14",
            ],
          }}
          onBarcodeScanned={scanned ? undefined : handleScan}
        />
      )}

      {/* Top Bar */}
      <XStack
        position="absolute"
        top={60}
        left={20}
        right={20}
        alignItems="center"
        justifyContent="space-between"
        zIndex={100}
      >
        {/* Flash Button - Top Left */}
        {showFlashToggle && (
          <TouchableOpacity
            onPress={() => setTorch((prev) => !prev)}
            style={styles.iconButton}
          >
            {torch ? (
              <Zap size={24} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <ZapOff size={24} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}

        {/* Title - Top Middle */}
        <Text style={styles.titleText}>Scan Part to Add</Text>

        {/* Close Button - Top Right */}
        <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </XStack>

      {/* Overlay with semi-transparent background */}
      <View pointerEvents="none" style={styles.overlay}>
        {/* Top dark area */}
        <View style={[{ flex: 1 }]} />

        {/* Middle section with scan box */}
        <XStack>
          {/* Left dark area */}
          <View
            style={[
              { width: (SCREEN_WIDTH - scanBoxSize) / 2, height: scanBoxSize },
            ]}
          />

          {/* Scan Box Area */}
          <View
            style={[
              styles.scanBoxContainer,
              { width: scanBoxSize, height: scanBoxSize },
            ]}
          >
            {/* Full border around the scan box */}
            <View style={[styles.fullBorder, { borderColor }]} />

            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineAnim }],
                  backgroundColor: lineColor,
                },
              ]}
            />
          </View>

          {/* Right dark area */}
          <View
            style={[
              { width: (SCREEN_WIDTH - scanBoxSize) / 2, height: scanBoxSize },
            ]}
          />
        </XStack>

        {/* Bottom dark area */}
        <View style={[{ flex: 1 }]} />
      </View>

      {/* Bottom Controls */}
      <XStack
        position="absolute"
        bottom={60}
        left={20}
        right={20}
        justifyContent="center"
        gap="$4"
      >
        {showResetButton && scanned && (
          <Button
            onPress={resetScanner}
            backgroundColor="rgba(0,0,0,0.6)"
            borderRadius="$4"
            paddingVertical="$3"
            paddingHorizontal="$6"
            borderWidth={1}
            borderColor="rgba(255,255,255,0.3)"
            pressStyle={{ opacity: 0.8, scale: 0.97 }}
            icon={<RotateCcw size={20} color="#FFFFFF" />}
          >
            <Text color="#FFFFFF" fontWeight="500">
              Scan Again
            </Text>
          </Button>
        )}
      </XStack>
    </View>
  );
};

export default QRScanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  scanBoxContainer: {
    width: 280,
    height: 280,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
  },
  fullBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: 24,
  },
  scanLine: {
    width: "85%",
    height: 3,
    position: "absolute",
    top: 10,
    left: 20,
    borderRadius: 2,
    shadowColor: "#00FF00",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
