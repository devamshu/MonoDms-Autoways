import { createAnimations } from "@tamagui/animations-reanimated";
import { shorthands } from "@tamagui/shorthands";
import { createFont, createTamagui } from "tamagui";

// Create Roboto font with exact size/line height requirements
const robotoFont = createFont({
  family: "Roboto",
  size: {
    1: 10, // Caption smallest
    2: 12, // Caption/Paragraph small
    3: 14, // Caption/Paragraph medium / Heading small
    4: 16, // Caption/Paragraph base / Heading medium
    5: 20, // Heading large / Caption large
    6: 24, // Heading x-large
  },
  lineHeight: {
    1: 13, // 10px * 1.3 = 13px
    2: 15.6, // 12px * 1.3 = 15.6px
    3: 18.2, // 14px * 1.3 = 18.2px
    4: 20.8, // 16px * 1.3 = 20.8px
    5: 26, // 20px * 1.3 = 26px
    6: 31.2, // 24px * 1.3 = 31.2px
  },
  weight: {
    "400": "400",
    "500": "500",
    "600": "600",
    "700": "700",
  },
});

const animations = createAnimations({
  fast: {
    type: "spring",
    damping: 20,
    mass: 1,
    stiffness: 250,
  },
  medium: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
});

// Tokens with consistent spacing/sizing
const tokens = {
  color: {
    primary: "#6362E7",
    secondary: "#F0F0FD",
    background: "#FFFFFF",
    backgroundSecondary: "#F5F5F5",
    borderThinColor: "#BFCDD9",
    disabled: "#B1BAC2",
    secondaryText: "#495A69",
    descriptionText: "#22292F",
    white: "#FFFFFF",
    black: "#000000",
    ghost: "#09090B",
    pending: "#F97316",
    pendingBackground: "#FEF3EB",
    success: "#117E24",
    successBackground: "#EDFDF1",
    error: "#D41717",
    errorBackground: "#FDEDED",
    ongoing: "#0B72EB",
    ongoingBackground: "#ECF6FF",
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
    statIconTeal: "#14B8A6",
    statIconBackgroundTeal: "#F0FDFA",
    statIconPink: "#EC4899",
    statIconBackgroundPink: "#FDF2F8",
    inputBackground: "#FFFFFF",
    placeholder: "#B1BAC2",
    inputBorderColor: "#E0E7EB",
    outline: "#E4E4E7",
  },
  space: {
    $true: 8, // Base spacing unit
    $1: 4, // 0.5x
    $2: 8, // 1x
    $3: 12, // 1.5x
    $4: 16, // 2x
    $5: 20, // 2.5x
    $6: 24, // 3x
    $7: 28, // 3.5x
    $8: 32, // 4x
    $9: 40, // 5x
    $10: 48, // 6x
    $11: 52,
    $12: 60,
  },
  size: {
    $true: 16, // Base size matches paragraph base (16px)
    $1: 10, // 10px - Caption smallest
    $2: 12, // 12px - Caption/Paragraph small
    $3: 14, // 14px - Caption/Paragraph medium / Heading small
    $4: 16, // 16px - Caption/Paragraph base / Heading medium
    $5: 20, // 20px - Heading large / Caption large
    $6: 24, // 24px - Heading x-large
    $7: 28,
    $8: 32,
    $9: 40,
    $10: 48,
    $11: 52,
    $12: 60,
  },
  radius: {
    $true: 8,
    $1: 4,
    $2: 8,
    $3: 12,
    $4: 16,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
  },
};

const lightTheme = {
  background: "#FFFFFF",
  backgroundSecondary: "#F5F5F5",
  foreground: "#1E1E1E",
  color: "#1E1E1E",
  borderColor: "#BFCDD9",
  primary: "#6362E7",
  vectorColor: "#6362E71A",
  secondary: "#F0F0FD",
  disabled: "#B1BAC2",
  secondaryText: "#495A69",
  descriptionText: "#22292F",
  white: "#FFFFFF",
  black: "#000000",
  pending: "#F97316",
  pendingBackground: "#FEF3EB",
  success: "#117E24",
  successBackground: "#EDFDF1",
  error: "#D41717",
  errorBackground: "#FDEDED",
  ongoing: "#0B72EB",
  ongoingBackground: "#ECF6FF",
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
  statIconTeal: "#14B8A6",
  statIconBackgroundTeal: "#F0FDFA",
  statIconPink: "#EC4899",
  statIconBackgroundPink: "#FDF2F8",
  inputBackground: "#FFFFFF",
  inputBorderColor: "#E0E7EB",
  placeholder: "#B1BAC2",
  outline: "#E4E4E7",
  ghost: "#09090B",
};

const darkTheme = {
  background: "#1E1E1E",
  backgroundSecondary: "#2A2A2A",
  foreground: "#F5F5F5",
  color: "#F5F5F5",
  borderColor: "#BFCDD9",
  primary: "#6362E7",
  vectorColor: "#6362E71A",
  secondary: "#F0F0FD",
  disabled: "#B1BAC2",
  secondaryText: "#D1D5DB",
  descriptionText: "#E5E7EB",
  white: "#FFFFFF",
  black: "#000000",
  pending: "#F97316",
  pendingBackground: "#3A2416",
  success: "#22C55E",
  successBackground: "#12351D",
  error: "#EF4444",
  errorBackground: "#3A1717",
  ongoing: "#0B72EB",
  ongoingBackground: "#102A43",
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
  statIconTeal: "#14B8A6",
  statIconBackgroundTeal: "#F0FDFA",
  statIconPink: "#EC4899",
  statIconBackgroundPink: "#FDF2F8",
  inputBackground: "#303A42",
  inputBorderColor: "#3A3A3A",
  placeholder: "#B1BAC2",
  outline: "#E4E4E7",
  ghost: "#09090B",
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
};

const config = createTamagui({
  themes,
  defaultFont: "roboto",
  fonts: {
    roboto: robotoFont,
    body: robotoFont,
    heading: robotoFont,
  },
  animations,
  tokens,
  shorthands,
});

export default config;
