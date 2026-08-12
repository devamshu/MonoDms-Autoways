import { Href, router } from "expo-router";

export const AppRoutes = {
  HOME: "/" as Href,
  ENTER_EMAIL: "/auth/enter-email" as Href,
  VERIFY_EMAIL: "/auth/verify-email" as Href,
  FORGOT_PASSWORD: "/auth/forgot-password" as Href,
  RESET_PASSWORD: "/auth/reset-password" as Href,
  LOGIN: "/auth/login" as Href,
  USERS: "/users" as Href,
  USERS_DETAIL: "/users/[id]" as Href,

  CRM_DASHBOARD: "/(dashboards)/crm" as Href,
  TABS: "/(tabs)" as Href,
  MODAL: "/modal" as Href,
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

// Simple navigation
// navigate.replace(AppRoutes.LOGIN);

// Navigation with params
// navigate.pushWithParams(AppRoutes.VERIFY_EMAIL, {
//   identifier,
//   identifierType,
//   flow
// });

// Or even simpler - use router directly with as any
// router.push({
//   pathname: AppRoutes.VERIFY_EMAIL,
//   params: { identifier, identifierType, flow }
// } as any);
