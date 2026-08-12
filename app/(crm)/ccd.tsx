import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { AddInquiryForm } from "@/host/dms-crm/app/ccd/AddForm/add-inquiry-form";
import { CCDInquiryScreen } from "@/host/dms-crm/app/ccd/ccd-inquiry";
import { CCDPsfScreen } from "@/host/dms-crm/app/ccd/ccd-psf";
import { CCDRetailScreen } from "@/host/dms-crm/app/ccd/ccd-retail";
import {
  clearCustomers,
  setActiveModule,
} from "@/host/dms-crm/app/features/ccd/store/ccd.slice";
import {
  fetchModuleCustomers,
  fetchModules,
} from "@/host/dms-crm/app/features/ccd/store/ccd.thunks";
import { AddFormButton } from "@/host/dms-crm/components/custom/buttons/addFormButton";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { Spinner, Text, XStack, YStack } from "tamagui";

export default function CCDScreen() {
  const dispatch = useAppDispatch();
  const {
    modules,
    activeModuleId,
    activeModuleType,
    loading,
    moduleCustomersArgs,
  } = useAppSelector((state) => state.crmCcd);
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  useEffect(() => {
    dispatch(fetchModules());

    return () => {
      dispatch(clearCustomers());
    };
  }, [dispatch]);

  useEffect(() => {
    if (modules.length > 0 && !activeModuleId && !tab) {
      dispatch(setActiveModule(modules[0].id));
    }
  }, [modules, activeModuleId, tab, dispatch]);

  useEffect(() => {
    if (!tab || modules.length === 0) return;

    const target = modules.find((m) => m.module_type === tab);
    if (target && target.id !== activeModuleId) {
      dispatch(setActiveModule(target.id));
      dispatch(clearCustomers());
    }

    router.setParams({ tab: undefined });
  }, [tab, modules, activeModuleId, dispatch]);

  const handleTabChange = (moduleId: number, moduleType: string) => {
    dispatch(setActiveModule(moduleId));
    dispatch(clearCustomers());
  };

  const handleRefresh = useCallback(async () => {
    await dispatch(fetchModules());
    if (!activeModuleId) return;
    await dispatch(
      fetchModuleCustomers(
        moduleCustomersArgs?.moduleId === activeModuleId
          ? moduleCustomersArgs
          : { moduleId: activeModuleId, params: { page: 1, page_size: 5 } },
      ),
    );
  }, [dispatch, activeModuleId, moduleCustomersArgs]);

  const renderContent = () => {
    if (loading && modules.length === 0) {
      return (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingTop="$10"
        >
          <Spinner size="large" color="$primary" />
          <Text marginTop="$4">Loading modules...</Text>
        </YStack>
      );
    }

    if (modules.length === 0 && !loading) {
      return (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingTop="$10"
        >
          <Text color="$secondaryText">No modules available</Text>
        </YStack>
      );
    }

    if (!activeModuleId) {
      return (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          paddingTop="$10"
        >
          <Spinner size="large" color="$primary" />
          <Text marginTop="$4">Loading module...</Text>
        </YStack>
      );
    }

    switch (activeModuleType) {
      case "inquiry":
        return <CCDInquiryScreen moduleId={activeModuleId} />;
      case "retail":
        return <CCDRetailScreen moduleId={activeModuleId} />;
      case "psf":
        return <CCDPsfScreen moduleId={activeModuleId} />;
      default:
        return <CCDInquiryScreen moduleId={activeModuleId} />;
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Dynamic Tabs */}
      <XStack gap="$4" padding="$4" backgroundColor="$background">
        {modules.map((module) => {
          const isActive = activeModuleId === module.id;
          return (
            <XStack
              key={module.id}
              flex={1}
              height={34}
              borderRadius={21}
              backgroundColor={isActive ? "$primary" : "$background"}
              alignItems="center"
              justifyContent="center"
              onPress={() => handleTabChange(module.id, module.module_type)}
              pressStyle={{ opacity: 0.8 }}
              style={{
                shadowColor: "$black",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text
                color={isActive ? "white" : "#666"}
                fontWeight="600"
                fontSize={14}
              >
                {module.name}
              </Text>
            </XStack>
          );
        })}
      </XStack>

      {/* Content */}
      <ScreenScrollView onRefresh={handleRefresh}>
        {renderContent()}
      </ScreenScrollView>

      {/* FAB - Only show for Inquiry module */}
      {activeModuleType === "inquiry" && activeModuleId && (
        <AddFormButton component={<AddInquiryForm />} title="Add Inquiry" />
      )}
    </YStack>
  );
}
