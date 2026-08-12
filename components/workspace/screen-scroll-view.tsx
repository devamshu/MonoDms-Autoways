import { ReactNode } from "react";
import { ScrollView, ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";
import { useScreenRefresh } from "./useScreenRefresh";
import { TAB_BAR_HEIGHT } from "./workspace-layout";

const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + 10;

interface Props extends ScrollViewProps {
  children: ReactNode;
  padded?: boolean;
  extraBottomSpace?: number;
  // Pull-to-refresh handler. When provided, a swipe-down refresh with a themed
  // spinner is wired up; the gesture is auth-gated (see useScreenRefresh).
  onRefresh?: () => Promise<unknown> | unknown;
}

export function ScreenScrollView({
  children,
  padded = true,
  extraBottomSpace = 0,
  onRefresh,
  contentContainerStyle,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const { refreshControl } = useScreenRefresh(onRefresh);

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      {...rest}
      refreshControl={refreshControl}
      contentContainerStyle={[
        {
          flexGrow: 1,
          paddingBottom: TAB_BAR_CLEARANCE + extraBottomSpace + insets.bottom,
        },
        contentContainerStyle,
      ]}
    >
      {padded ? <YStack padding="$4">{children}</YStack> : children}
    </ScrollView>
  );
}
