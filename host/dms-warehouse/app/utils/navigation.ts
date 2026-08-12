import { Href, router } from "expo-router";

export const AppRoutes = {
  HOME: "/" as Href,
  ENTER_EMAIL: "/auth/enter-email" as Href,
  VERIFY_EMAIL: "/auth/verify-email" as Href,
  FORGOT_PASSWORD: "/auth/forgot-password" as Href,
  RESET_PASSWORD: "/auth/reset-password" as Href,
  LOGIN: "/auth/login" as Href,
  TABS: "/(tabs)" as Href,
  PARTS_SCREEN: "/(warehouse)/part" as Href,
  Vehicle_SCREEN: "/(warehouse)/vehicle" as Href,
  ORDER_SCREEN: "/(warehouse)/orders" as Href,
  MODAL: "/modal" as Href,
  ORDER_PARTS: "/order/order-parts" as Href,

  PERSONAL_INFORMATION: "/profile/personal-information" as Href,
  LOGIN_AND_SECURITY: "/profile/login-and-security" as Href,
  NOTIFICATIONS: "/profile/notification" as Href,

  // Just a testing use as base
  QR_ORDERS: "/order/scan-order" as Href,
} as const;

export const navigate = {
  replace: (route: Href) => router.replace(route),
  push: (route: Href) => router.push(route),
  pushWithParams: (
    pathname: Href,
    params?: Record<string, string | undefined>,
  ) => router.push({ pathname, params } as any),
  replaceWithParams: (
    pathname: Href,
    params?: Record<string, string | undefined>,
  ) => router.replace({ pathname, params } as any),
  back: () => router.back(),
};
