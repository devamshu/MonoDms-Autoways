import { usersFilterConfig } from "../components/custom/filter/filter.config";
import {
    FilterProvider,
    useFilters,
} from "../components/custom/filter/filterContext";
import { GenericFilterModal } from "../components/custom/filter/GenericFilterModal";
import { Navbar } from "../components/custom/navbar";
import { SlideOpenProvider } from "../../../components/auth/slideOpen";
import { ToastProvider } from "../components/custom/toast";
import { useColorScheme } from "../hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { TamaguiProvider, Theme, YStack } from "tamagui";
import { resetAuth } from "../../../app/features/auth/store/auth.slice";
import { useAppDispatch } from "../../../app/features/hooks";
import { setApiAuthFailureHandler } from "../../../app/services/axios";
import config from "../tamagui.config";
import { persistor, store } from "./features/store";
import { AppRoutes, navigate } from "./utils/navigation";
import { PortalProvider } from "@tamagui/portal";

const FULLSCREEN_ROUTES = ["/auth", "/modal"];

const ROUTE_FILTER_CONFIGS: Record<string, any> = {
  "/users": usersFilterConfig,
};

function AppContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeFilterCount,
    openFilters,
    isFilterVisible,
    closeFilters,
    activeFilters,
    currentFilterConfig,
    applyFilters,
    resetFilters,
  } = useFilters();

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

      {/* Content container with rounded top corners */}
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopLeftRadius={isFullscreen ? 0 : 24}
        borderTopRightRadius={isFullscreen ? 0 : 24}
        marginTop={isFullscreen ? 0 : -20}
        overflow="hidden"
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="discount/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="customer/[id]" options={{ headerShown: false }} />
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

      {currentFilterConfig && (
        <GenericFilterModal
          visible={isFilterVisible}
          onClose={closeFilters}
          title={currentFilterConfig.title}
          fields={currentFilterConfig.fields}
          initialValues={activeFilters}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      )}
    </YStack>
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
        <PortalProvider shouldAddRootHost>
          <SlideOpenProvider>
            <Theme name={colorScheme === "light" ? "dark" : "light"}>
              <ThemeProvider
                value={colorScheme === "light" ? DarkTheme : DefaultTheme}
              >
                <AppContent />
                <StatusBar style="light" />
              </ThemeProvider>
            </Theme>
          </SlideOpenProvider>
        </PortalProvider>
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
