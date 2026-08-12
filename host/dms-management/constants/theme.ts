/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

// Match Tamagui color scheme
const tintColorLight = "#1569B3"; // primary color from Tamagui
const tintColorDark = "#1569B3"; // Keep primary consistent, or use '#F5F5F5' for dark mode
const iconSelected = "#E02228";

export const Colors = {
  light: {
    text: "#1D1D1D",
    background: "#F5F5F5",
    tint: tintColorLight,
    icon: "#1D1D1D",
    tabIconDefault: "#1D1D1D",
    tabIconSelected: iconSelected,
    primary: "#6362E7",
    secondary: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    borderThinColor: "#BFCDD9",
    disabled: "#B1BAC2",
    secondaryText: "#495A69",
    descriptionText: "#22292F",
    white: "#FFFFFF",
    black: "#000000",
    vectorColor: "#6362E71A",
    pending: "#F97316",
    pendingBackground: "#FEF3EB",
    success: "#117E24",
    successBackground: "#EDFDF1",
    error: "#D41717",
    errorBackground: "#FDEDED",
    ongoing: "#0B72EB",
    ongoingBackground: "#ECF6FF",
    inputBackground: "#FFFFFF",
    danger: "#EF4444",
    statIconIndigo: "#6366F1",
    statIconBackgroundIndigo: "#EEF2FF",
    statIconEmerald: "#10B981",
    statIconBackgroundEmerald: "#ECFDF5",
    statIconAmber: "#F59E0B",
    statIconBackgroundAmber: "#FFFBEB",
    statIconRose: "#F43F5E",
    statIconBackgroundRose: "#FFF1F2",
    statIconSky: "#0EA5E9",
    statIconBackgroundSky: "#F0F9FF",
    statIconViolet: "#8B5CF6",
    statIconBackgroundViolet: "#F5F3FF",
    placeholder: "#B1BAC2",
    inputBorderColor: "#E0E7EB",
  },

  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#1D1D1D",
    tabIconDefault: "#1D1D1D",
    tabIconSelected: iconSelected,
    primary: "#6362E7",
    secondary: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    borderThinColor: "#BFCDD9",
    disabled: "#B1BAC2",
    secondaryText: "#495A69",
    descriptionText: "#22292F",
    white: "#FFFFFF",
    black: "#000000",
    placeholder: "#B1BAC2",
    pending: "#F97316",
    pendingBackground: "#FEF3EB",
    success: "#117E24",
    successBackground: "#EDFDF1",
    error: "#D41717",
    errorBackground: "#FDEDED",
    ongoing: "#0B72EB",
    ongoingBackground: "#ECF6FF",
    inputBackground: "#FFFFFF",
    statIconIndigo: "#6366F1",
    statIconBackgroundIndigo: "#EEF2FF",
    statIconEmerald: "#10B981",
    statIconBackgroundEmerald: "#ECFDF5",
    statIconAmber: "#F59E0B",
    statIconBackgroundAmber: "#FFFBEB",
    statIconRose: "#F43F5E",
    statIconBackgroundRose: "#FFF1F2",
    statIconSky: "#0EA5E9",
    statIconBackgroundSky: "#F0F9FF",
    statIconViolet: "#8B5CF6",
    statIconBackgroundViolet: "#F5F3FF",
    inputBorderColor: "#3A3A3A",

    danger: "#EF4444",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
