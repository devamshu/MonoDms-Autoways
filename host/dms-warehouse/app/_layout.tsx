import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { TamaguiProvider, Theme, YStack } from "tamagui";
import { resetAuth } from "../../../app/features/auth/store/auth.slice";
import { useAppDispatch } from "../../../app/features/hooks";
import { setApiAuthFailureHandler } from "../../../app/services/axios";
import { SlideOpenProvider } from "../../../components/auth/slideOpen";
import { getPartsFilterConfig } from "../components/custom/filter/config/parts.config";
import { getVehicleStockFilterConfig } from "../components/custom/filter/config/vehicle.config";
import {
  FilterProvider,
  useFilters,
} from "../components/custom/filter/filterContext";
import { GenericFilterModal } from "../components/custom/filter/GenericFilterModal";
import { Navbar } from "../components/custom/navbar";
import { ToastProvider } from "../components/custom/toast";
import { useColorScheme } from "../hooks/use-color-scheme";
import config from "../tamagui.config";
import { persistor, store } from "./features/store";
import { AppRoutes, navigate } from "./utils/navigation";

const FULLSCREEN_ROUTES = ["/auth", "/modal"];

const ROUTE_FILTER_CONFIGS: Record<string, any> = {
  "/vehicle": getVehicleStockFilterConfig(),
  "/part": getPartsFilterConfig(),
};

function AppContent() {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const {
    activeFilterCount,
    openFilters,
    isFilterVisible,
    closeFilters,
    activeFilters,
    currentFilterConfig,
    applyFilters,
    resetFilters,
    clearAllFilters,
  } = useFilters();

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      clearAllFilters();
      prevPathnameRef.current = pathname;
    }
  }, [pathname, clearAllFilters]);

  const filterConfig = ROUTE_FILTER_CONFIGS[pathname];
  const shouldShowFilter = !!filterConfig;

  //  routes that should NOT show the global navbar
  const hideNavbarRoutes = ["/parts/location-parts"];
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);
  const isFullscreen = FULLSCREEN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  return (
    <YStack flex={1} backgroundColor="$primary">
      {!isFullscreen && !shouldHideNavbar && (
        <Navbar
          showFilter={shouldShowFilter}
          onFilterPress={() => filterConfig && openFilters(filterConfig)}
          activeFilterCount={activeFilterCount}
        />
      )}
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopLeftRadius={isFullscreen || shouldHideNavbar ? 0 : 24}
        borderTopRightRadius={isFullscreen || shouldHideNavbar ? 0 : 24}
        marginTop={isFullscreen || shouldHideNavbar ? 0 : -10}
        overflow="hidden"
      >
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="parts" options={{ headerShown: false }} />
          <Stack.Screen name="order" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
      </YStack>

      {currentFilterConfig && (
        <GenericFilterModal
          visible={isFilterVisible}
          onClose={closeFilters}
          title={currentFilterConfig.title}
          fields={currentFilterConfig.fields}
          initialValues={activeFilters}
          onApply={applyFilters}
          onReset={resetFilters}
          drawerHeight={currentFilterConfig.drawerHeight}
        />
      )}
    </YStack>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Set up auth failure handler for when tokens expire or refresh fails
    setApiAuthFailureHandler(async () => {
      try {
        // Clear persisted state to avoid rehydration of stale tokens
        await persistor.purge();
      } catch (e) {
        console.error("[Auth] Failed to purge persistor:", e);
      }

      // Reset Redux auth slice
      dispatch(resetAuth());

      // Ensure client tokens are cleared (should already be cleared by ApiClient)
      try {
        navigate.replace(AppRoutes.LOGIN);
      } catch (e) {
        console.error("[Auth] Failed to navigate to login:", e);
      }
    });
  }, [dispatch]);

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={colorScheme === "light" ? "dark" : "light"}
    >
      <ToastProvider>
        {/* Remove PortalProvider - TamaguiProvider already includes it */}
        <SlideOpenProvider>
          <Theme name={colorScheme === "light" ? "dark" : "light"}>
            <ThemeProvider
              value={colorScheme === "light" ? DarkTheme : DefaultTheme}
            >
              <AppContent />
              <StatusBar style="auto" />
            </ThemeProvider>
          </Theme>
        </SlideOpenProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <FilterProvider>
          <RootLayoutContent />
        </FilterProvider>
      </PersistGate>
    </Provider>
  );
}

export const unstable_settings = {
  initialRouteName: "index",
};
