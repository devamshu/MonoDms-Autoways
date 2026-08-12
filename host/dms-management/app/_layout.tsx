import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { TamaguiProvider, Theme, useTheme, YStack } from "tamagui";
import { resetAuth } from "../../../app/features/auth/store/auth.slice";
import { useAppDispatch } from "../../../app/features/hooks";
import { setApiAuthFailureHandler } from "../../../app/services/axios";
import { SlideOpenProvider } from "../../../components/auth/slideOpen";
import { getCrmDashboardFilterConfig } from "../components/custom/filter/config/crmDashboard.config";
import { getUserFilterConfig } from "../components/custom/filter/config/user.config";
import {
  FilterProvider,
  useFilters,
} from "../components/custom/filter/filterContext";
import { GenericFilterModal } from "../components/custom/filter/GenericFilterModal";
import { Navbar } from "../components/custom/navbar";
import Sidebar from "../components/custom/sideBar";
import { SidebarProvider } from "../components/custom/sideBarContext";
import { ToastProvider } from "../components/custom/toast";
import { useColorScheme } from "../hooks/use-color-scheme";
import config from "../tamagui.config";
import { clearProfile } from "./features/profile/store/profile.slice";
import { persistor, store } from "./features/store";
import { AppRoutes, navigate } from "./utils/navigation";

const FULLSCREEN_ROUTES = ["/", "/auth", "/modal"];

const ROUTE_FILTER_CONFIGS: Record<string, any> = {
  "/users": getUserFilterConfig(),
};

// All dashboards share the same fiscal_year / dealer / brand filter.
// Build it ONCE and point every dashboard route at the same reference.
const dashboardFilterConfig = getCrmDashboardFilterConfig();

const DASHBOARD_ROUTES = [
  "/crm",
  "/dealer",
  "/logistic",
  "/sparepart",
  "/service",
];

DASHBOARD_ROUTES.forEach((route) => {
  ROUTE_FILTER_CONFIGS[route] = dashboardFilterConfig;
});

function AppContent() {
  const router = useRouter();
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
  const isFullscreen = FULLSCREEN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  return (
    <YStack flex={1} backgroundColor="$primary">
      {!isFullscreen && (
        <Navbar
          showFilter={shouldShowFilter}
          onFilterPress={() => filterConfig && openFilters(filterConfig)}
          activeFilterCount={activeFilterCount}
        />
      )}
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopLeftRadius={isFullscreen ? 0 : 24}
        borderTopRightRadius={isFullscreen ? 0 : 24}
        marginTop={isFullscreen ? 0 : -20}
        overflow="hidden"
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="users/index" options={{ headerShown: false }} />
          <Stack.Screen name="users/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="dealer/index" options={{ headerShown: false }} />
          <Stack.Screen name="orders/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="sparepart/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(dashboards)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
              title: "Modal",
              headerShown: false,
            }}
          />
        </Stack>
      </YStack>

      <Sidebar
        activeRoute={pathname}
        onNavigate={(path) => router.push(path as any)}
      />

      {/* Global Filter Modal - uses current config */}
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

function GestureHandlerWrapper({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const backgroundColor = theme.background?.val || "#1E1E1E";

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      {children}
    </GestureHandlerRootView>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setApiAuthFailureHandler(async () => {
      console.log(
        "[Auth] Auth failure detected, purging persisted store, resetting auth state and navigating to login",
      );
      try {
        await persistor.purge();
      } catch (e) {
        console.error("[Auth] Failed to purge persistor:", e);
      }
      dispatch(resetAuth());
      dispatch(clearProfile());
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
        <SlideOpenProvider>
          <Theme name={colorScheme === "light" ? "dark" : "light"}>
            <ThemeProvider
              value={colorScheme === "light" ? DarkTheme : DefaultTheme}
            >
              <GestureHandlerWrapper>
                <AppContent />
              </GestureHandlerWrapper>
              <StatusBar style="light" />
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
        <SidebarProvider>
          <FilterProvider>
            <RootLayoutContent />
          </FilterProvider>
        </SidebarProvider>
      </PersistGate>
    </Provider>
  );
}

export const unstable_settings = {
  initialRouteName: "index",
};
