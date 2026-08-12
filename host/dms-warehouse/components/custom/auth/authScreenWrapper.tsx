import { DefaultImages } from "@/constants/image";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ScrollView, useTheme, View } from "tamagui";

const VectorTop = DefaultImages.vectorTop;
const VectorBottom = DefaultImages.vectorBottom;

interface AuthScreenWrapperProps {
  children: ReactNode;
  showBack?: boolean;
  scrollable?: boolean;
  onBack?: () => void;
}

export function AuthScreenWrapper({
  children,
  showBack = true,
  scrollable = false,
  onBack,
}: AuthScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const ContentWrapper = scrollable ? ScrollView : View;
  const theme = useTheme();

  return (
    <View flex={1} backgroundColor="$background">
      <Image
        source={VectorTop}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 250,
          zIndex: 0,
        }}
        resizeMode="stretch"
      />
      <Image
        source={VectorBottom}
        style={{
          position: "absolute",
          bottom: 0,
          right: -20,
          width: "110%",
          height: 250,
          zIndex: 0,
        }}
        resizeMode="stretch"
      />

      {showBack && (
        <Button
          position="absolute"
          left={20}
          zIndex={10}
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="rgba(255,255,255,0.6)"
          justifyContent="center"
          alignItems="center"
          top={insets.top + 10}
          onPress={handleBack}
          opacity={0.7}
          pressStyle={{ opacity: 0.5 }}
          chromeless
        >
          <ChevronLeft size={20} color={theme.primarylow?.val} />
        </Button>
      )}

      <ContentWrapper flex={1} zIndex={1} paddingTop={insets.top + 60}>
        {children}
      </ContentWrapper>
    </View>
  );
}
