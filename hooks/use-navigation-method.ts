import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type NavigationMethod = "gesture" | "three-button" | "unknown";

export function useNavigationMethod() {
  const [navMethod, setNavMethod] = useState<NavigationMethod>("unknown");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS !== "android") {
      setNavMethod("gesture");
      return;
    }

    // 1. Fetch hardware dimensions vs application window dimensions
    const screenHeight = Dimensions.get("screen").height;
    const windowHeight = Dimensions.get("window").height;

    // 2. Calculate the system bar overhead
    const navBarHeightDiff = screenHeight - windowHeight;

    /**
     * Diagnostic Logic:
     * When edge-to-edge is disabled (default in Expo Go/standard apps),
     * insets.bottom is artificially padded by the OS.
     *
     * However, the hardware difference (navBarHeightDiff) remains precise:
     * - 3-Button mode leaves a massive reserved bar gap (usually ~48-100+ dp)
     * - Gesture pills leave almost nothing or a minimal line (usually < 24 dp)
     */
    const actualBottomSpace =
      navBarHeightDiff > 0 ? navBarHeightDiff : insets.bottom;

    if (actualBottomSpace > 0 && actualBottomSpace < 30) {
      setNavMethod("gesture");
    } else if (actualBottomSpace >= 30) {
      setNavMethod("three-button");
    } else {
      // 0px gap means immersive mode or edge-to-edge gestures are successfully rendering
      setNavMethod("gesture");
    }
  }, [insets.bottom]);

  return { navMethod, paddingTop: insets.top };
}
