import { persistor, store } from "@/host/dms-warehouse/app/features/store";
import { getPartsFilterConfig } from "@/host/dms-warehouse/components/custom/filter/config/parts.config";
import { getVehicleStockFilterConfig } from "@/host/dms-warehouse/components/custom/filter/config/vehicle.config";
import {
  FilterProvider,
  useFilters,
} from "@/host/dms-warehouse/components/custom/filter/filterContext";
import { GenericFilterModal } from "@/host/dms-warehouse/components/custom/filter/GenericFilterModal";
import { Navbar } from "@/host/dms-warehouse/components/custom/navbar";
import { ToastProvider } from "@/host/dms-warehouse/components/custom/toast";
import { usePathname } from "expo-router";
import {
  Box,
  CarFront,
  House,
  LucideSettings,
  Wrench,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { YStack } from "tamagui";
import { WorkspaceTabsLayout } from "../../components/workspace/workspace-layout";

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
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        marginTop={-20}
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
              name: "vehicle",
              title: "Vehicle",
              icon: (color: string) => <CarFront size={28} color={color} />,
            },
            {
              name: "part",
              title: "Parts",
              icon: (color: string) => <Wrench size={28} color={color} />,
            },
            {
              name: "orders",
              title: "Orders",
              icon: (color: string) => <Box size={28} color={color} />,
            },
            {
              name: "setting",
              title: "Settings",
              icon: (color: string) => (
                <LucideSettings size={28} color={color} />
              ),
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
          drawerHeight={currentFilterConfig.drawerHeight}
        />
      )}
    </YStack>
  );
}

export default function WarehouseLayout() {
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
