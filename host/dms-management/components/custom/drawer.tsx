import { X } from "lucide-react-native";
import { ReactNode, useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import {
  Button,
  Sheet,
  styled,
  Text,
  useTheme,
  XStack,
  YStack,
} from "tamagui";
import { useNavigationMethod } from "../../../../hooks/use-navigation-method";

interface BottomDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerTitle?: string;
  headerRightContent?: ReactNode;
  children: ReactNode;
  stickyBottomContent?: ReactNode;
  height?: number; // percentage of screen height (0-100)
  snapToBottom?: boolean; // whether to close when snapping to bottom
  // Disable the drawer's own scroll, e.g. while a dropdown nested inside
  // is expanded, so a scroll gesture over the dropdown's option list
  // doesn't also drag the drawer's content underneath it.
  scrollEnabled?: boolean;
}

const StyledSheet = styled(Sheet, {
  name: "BottomDrawer",
});

const StyledSheetFrame = styled(Sheet.Frame, {
  backgroundColor: "$background",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 5,
});

const StickyFooter = styled(YStack, {
  backgroundColor: "$background",
  paddingTop: "$4",
  paddingHorizontal: "$4",
  borderTopWidth: 1,
  borderTopColor: "$borderThinColor",
});

export function BottomDrawer({
  open,
  onOpenChange,
  headerTitle,
  headerRightContent,
  children,
  stickyBottomContent,
  height = 85, // percentage of screen height
  snapToBottom = true,
  scrollEnabled = true,
}: BottomDrawerProps) {
  const theme = useTheme();
  const { navMethod } = useNavigationMethod();

  const bgColor = theme.background?.val || "#FFFFFF";
  const bottomPadding =
    Platform.OS === "ios" ? "$8" : navMethod === "three-button" ? "$8" : "$4";

  return (
    <StyledSheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[height]}
      snapPointsMode="percent"
      dismissOnSnapToBottom={snapToBottom}
      dismissOnOverlayPress
      backgroundColor={bgColor}
    >
      <Sheet.Overlay
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
        backgroundColor="#000"
      />

      <StyledSheetFrame backgroundColor={bgColor}>
        {/* Drag Handle */}
        <XStack justifyContent="center" paddingTop="$2" paddingBottom="$1">
          <YStack
            width={40}
            height={4}
            backgroundColor="$borderColor"
            borderRadius={2}
          />
        </XStack>

        {/* Header Section */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="$4"
          paddingTop="$2"
          paddingBottom="$3"
          borderBottomWidth={1}
          borderBottomColor="$inputBorderColor"
        >
          <YStack flex={1}>
            {headerTitle && (
              <Text fontSize="$6" fontWeight="600" color="$color">
                {headerTitle}
              </Text>
            )}
          </YStack>

          <XStack gap="$2" alignItems="center">
            {headerRightContent}
            <Button
              size="$3"
              chromeless
              circular
              onPress={() => onOpenChange(false)}
              icon={<X size={20} color={theme.color?.val} />}
              pressStyle={{ scale: 0.95, opacity: 0.7 }}
            />
          </XStack>
        </XStack>

        {/* Scrollable Content Area — Sheet.ScrollView (not the plain tamagui
            ScrollView) so its scroll gesture is coordinated with the Sheet's
            own drag-to-dismiss gesture instead of conflicting with it. */}
        <Sheet.ScrollView
          showsVerticalScrollIndicator={true}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={{
            paddingBottom: stickyBottomContent ? 0 : 16,
          }}
        >
          <YStack paddingHorizontal="$4" paddingTop="$3" gap="$3">
            {children}
          </YStack>
        </Sheet.ScrollView>

        {stickyBottomContent && (
          <StickyFooter paddingBottom={bottomPadding} backgroundColor={bgColor}>
            {stickyBottomContent}
          </StickyFooter>
        )}
      </StyledSheetFrame>
    </StyledSheet>
  );
}
