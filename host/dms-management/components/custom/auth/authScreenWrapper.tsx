import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";

const VectorTop = require("@/assets/dms/VectorTop.png");
const VectorBottom = require("@/assets/dms/VectorBottom.png");

interface AuthScreenWrapperProps {
  children: ReactNode;
  showBack?: boolean;
  scrollable?: boolean;
  onBack?: () => void;
}

export function AuthScreenWrapper({
  children,
  showBack = true,
  onBack,
}: AuthScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View flex={1} backgroundColor="$background">
      <Image source={VectorTop} style={styles.vectorTop} resizeMode="stretch" />
      <Image
        source={VectorBottom}
        style={styles.vectorBottom}
        resizeMode="stretch"
      />

      {showBack && (
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color="#555" />
        </TouchableOpacity>
      )}

      <View flex={1} zIndex={1} paddingTop={insets.top + 60}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  vectorTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 250,
    zIndex: 0,
  },
  vectorBottom: {
    position: "absolute",
    bottom: 0,
    right: -20,
    width: "110%",
    height: 250,
    zIndex: 0,
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
