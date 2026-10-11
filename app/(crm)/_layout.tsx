import { persistor, store } from "@/host/dms-crm/app/features/store";
import { usersFilterConfig } from "@/host/dms-crm/components/custom/filter/filter.config";
import {
  FilterProvider,
  useFilters,
} from "@/host/dms-crm/components/custom/filter/filterContext";
import { GenericFilterModal } from "@/host/dms-crm/components/custom/filter/GenericFilterModal";
import { Navbar } from "@/host/dms-crm/components/custom/navbar";
import Sidebar from "@/host/dms-crm/components/custom/sideBar";
import { SidebarProvider } from "@/host/dms-crm/components/custom/sideBarContext";
import { ToastProvider } from "@/host/dms-crm/components/custom/toast";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { YStack } from "tamagui";

const FULLSCREEN_ROUTES = ["/auth", "/modal"];

const ROUTE_FILTER_CONFIGS: Record<string, any> = {
  "/users": usersFilterConfig,
};

function AppContent() {
  const pathname = usePathname();
  const router = useRouter();
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
        />
      )}
    </YStack>
  );
}

export default function CrmLayout() {
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
