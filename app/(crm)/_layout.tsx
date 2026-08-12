import { persistor, store } from "@/host/dms-crm/app/features/store";
import { usersFilterConfig } from "@/host/dms-crm/components/custom/filter/filter.config";
import {
  FilterProvider,
  useFilters,
} from "@/host/dms-crm/components/custom/filter/filterContext";
import { GenericFilterModal } from "@/host/dms-crm/components/custom/filter/GenericFilterModal";
import { Navbar } from "@/host/dms-crm/components/custom/navbar";
import { ToastProvider } from "@/host/dms-crm/components/custom/toast";
import { usePathname } from "expo-router";
import {
  House,
  Info,
  LucideSettings,
  Percent,
  Users,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { YStack } from "tamagui";
import { WorkspaceTabsLayout } from "../../components/workspace/workspace-layout";

const FULLSCREEN_ROUTES = ["/auth", "/modal"];

const ROUTE_FILTER_CONFIGS: Record<string, any> = {
  "/users": usersFilterConfig,
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
        <WorkspaceTabsLayout
          tabs={[
            {
              name: "index",
              title: "Dashboard",
              icon: (color: string) => <House size={28} color={color} />,
            },
            {
              name: "customer",
              title: "Customer",
              icon: (color: string) => <Users size={28} color={color} />,
            },
            {
              name: "discount",
              title: "Discount",
              icon: (color: string) => <Percent size={28} color={color} />,
            },
            {
              name: "ccd",
              title: "CCD",
              icon: (color: string) => <Info size={28} color={color} />,
            },
            {
              name: "setting",
              title: "Settings",
              icon: (color: string) => <LucideSettings size={28} color={color} />,
            },
          ]}
        />
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

export default function CrmLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <FilterProvider>
            <AppContent />
          </FilterProvider>
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
}
