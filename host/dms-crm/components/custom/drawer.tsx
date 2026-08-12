import { X } from "lucide-react-native";
import { ReactNode, useEffect } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Button,
  ScrollView,
  Sheet,
  styled,
  Text,
  useTheme,
  XStack,
  YStack,
} from "tamagui";
import { useNavigationMethod } from "../../../../hooks/use-navigation-method";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headerTitle?: string;
  headerRightContent?: ReactNode;
  children: ReactNode;
  stickyBottomContent?: ReactNode;
  height?: number; // percentage of screen height (0-100)
  snapToBottom?: boolean; // whether to close when snapping to bottom
  // Turn off the drawer's own scrolling when the content scrolls itself (e.g.
  // a picker that pins a search box above a scrolling option list), so the two
  // scroll views don't fight over the gesture.
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
  borderTopColor: "$outline",
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

  // Convert percentage to actual pixel value
  const drawerHeight = (height / 100) * SCREEN_HEIGHT;
  const bgColor = theme.background?.val || "#FFFFFF";
  const bottomPadding =
    Platform.OS === "ios" ? "$8" : navMethod === "three-button" ? "$8" : "$4";

  // The sheet tears down while an input inside it may still be focused, and
  // nothing blurs it on the way out — the keyboard then outlives the drawer
  // with no field left to tap away from. Close it on every exit path (X button,
  // overlay press, snap-to-bottom, or the parent flipping `open`) and on
  // unmount, so the drawer never leaves a keyboard stranded on screen.
  useEffect(() => {
    if (!open) Keyboard.dismiss();
  }, [open]);

  useEffect(() => () => Keyboard.dismiss(), []);

  return (
    <StyledSheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[drawerHeight]}
      snapPointsMode="constant"
      dismissOnSnapToBottom={snapToBottom}
      dismissOnOverlayPress
      // Lift the frame by the keyboard height so focused fields (and the
      // sticky footer's actions) stay above it instead of being covered.
      moveOnKeyboardChange
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
            backgroundColor="$outline"
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
          borderBottomColor={theme.outline?.val}
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

        {/* Scrollable Content Area */}
        <ScrollView
          flex={1}
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={true}
          // "handled" lets buttons inside the drawer fire on the first tap
          // while the keyboard is up, instead of the tap being swallowed just
          // to dismiss it.
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: stickyBottomContent ? 0 : 16,
          }}
        >
          {/* Numeric keyboards have no return key, so tapping empty space is
              the only way out of a field like the discount amount. */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <YStack paddingHorizontal="$4" paddingTop="$3" gap="$3">
              {children}
            </YStack>
          </TouchableWithoutFeedback>
        </ScrollView>

        {stickyBottomContent && (
          <StickyFooter paddingBottom={bottomPadding} backgroundColor={bgColor}>
            {stickyBottomContent}
          </StickyFooter>
        )}
      </StyledSheetFrame>
    </StyledSheet>
  );
}
