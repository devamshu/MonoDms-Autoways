import { persistor, store } from "@/host/dms-management/app/features/store";
import { getCrmDashboardFilterConfig } from "@/host/dms-management/components/custom/filter/config/crmDashboard.config";
import {
  FilterProvider,
  useFilters,
} from "@/host/dms-management/components/custom/filter/filterContext";
import { GenericFilterModal } from "@/host/dms-management/components/custom/filter/GenericFilterModal";
import { Navbar } from "@/host/dms-management/components/custom/navbar";
import Sidebar from "@/host/dms-management/components/custom/sideBar";
import { SidebarProvider } from "@/host/dms-management/components/custom/sideBarContext";
import { ToastProvider } from "@/host/dms-management/components/custom/toast";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { YStack } from "tamagui";

const dashboardFilterConfig = getCrmDashboardFilterConfig();
const DASHBOARD_ROUTES = [
  "/crm",
  "/dealer",
  "/logistic",
  "/sparepart",
  "/service",
];

const ROUTE_FILTER_CONFIGS: Record<string, any> = {};

DASHBOARD_ROUTES.forEach((route) => {
  ROUTE_FILTER_CONFIGS[route] = dashboardFilterConfig;
});
const FULLSCREEN_ROUTES = ["/auth", "/modal"];

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

  const normalizedPathname = pathname.startsWith("/(management)")
    ? pathname.replace("/(management)", "")
    : pathname;

  const isFullscreen = FULLSCREEN_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
  const filterConfig =
    ROUTE_FILTER_CONFIGS[normalizedPathname] ?? ROUTE_FILTER_CONFIGS[pathname];
  const shouldShowFilter = !!filterConfig;

  return (
    <YStack flex={1} backgroundColor="$primary">
      <Navbar
        showFilter={shouldShowFilter}
        onFilterPress={() => filterConfig && openFilters(filterConfig)}
        activeFilterCount={activeFilterCount}
      />

      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopLeftRadius={isFullscreen ? 0 : 24}
        borderTopRightRadius={isFullscreen ? 0 : 24}
        marginTop={isFullscreen ? 0 : -20}
        overflow="hidden"
      >
        <Slot />
      </YStack>

      <Sidebar
        activeRoute={pathname}
        onNavigate={(path) => router.push(path as any)}
      />

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

export default function ManagementLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <SidebarProvider>
            <FilterProvider>
              <AppContent />
            </FilterProvider>
          </SidebarProvider>
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
}
