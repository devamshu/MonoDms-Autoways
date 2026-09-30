import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { AddFollowupForm } from "@/host/dms-crm/app/ccd/AddForm/add-followup-form";
import { AddInquiryForm } from "@/host/dms-crm/app/ccd/AddForm/add-inquiry-form";
import { CCDFollowupScreen } from "@/host/dms-crm/app/ccd/ccd-followup";
import { CCDInquiryScreen } from "@/host/dms-crm/app/ccd/ccd-inquiry";
import { CCDPsfScreen } from "@/host/dms-crm/app/ccd/ccd-psf";
import { CCDRetailScreen } from "@/host/dms-crm/app/ccd/ccd-retail";
import {
  clearCustomers,
  setActiveModule,
  setFollowupMode,
} from "@/host/dms-crm/app/features/ccd/store/ccd.slice";
import {
  fetchFollowups,
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
  const followupActive = activeModuleType === "followup";

  useEffect(() => {
    dispatch(fetchModules());

    return () => {
      dispatch(clearCustomers());
    };
  }, [dispatch]);

  useEffect(() => {
    if (modules.length === 0) return;

    if (tab) {
      if (tab === "followup") {
        dispatch(setFollowupMode());
      } else {
        const target = modules.find((m) => m.module_type === tab);
        if (target && target.id !== activeModuleId) {
          dispatch(setActiveModule(target.id));
          dispatch(clearCustomers());
        }
      }
      router.setParams({ tab: undefined });
      return;
    }

    if (!activeModuleId && !followupActive) {
      dispatch(setActiveModule(modules[0].id));
    }
  }, [modules, activeModuleId, tab, followupActive, dispatch]);

  const handleTabChange = (moduleId: number) => {
    dispatch(setActiveModule(moduleId));
    dispatch(clearCustomers());
  };

  const handleFollowupTabPress = () => {
    dispatch(setFollowupMode());
  };

  const handleRefresh = useCallback(async () => {
    if (followupActive) {
      await dispatch(fetchFollowups());
      return;
    }
    await dispatch(fetchModules());
    if (!activeModuleId) return;
    await dispatch(
      fetchModuleCustomers(
        moduleCustomersArgs?.moduleId === activeModuleId
          ? moduleCustomersArgs
          : { moduleId: activeModuleId, params: { page: 1, page_size: 5 } },
      ),
    );
  }, [dispatch, activeModuleId, moduleCustomersArgs, followupActive]);

  const renderContent = () => {
    if (followupActive) {
      return <CCDFollowupScreen />;
    }

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
          const isActive = !followupActive && activeModuleId === module.id;
          return (
            <XStack
              key={module.id}
              flex={1}
              height={34}
              borderRadius={21}
              backgroundColor={isActive ? "$primary" : "$background"}
              alignItems="center"
              justifyContent="center"
              onPress={() => handleTabChange(module.id)}
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

        {/* Inquiry Followup Tab */}
        <XStack
          flex={1}
          height={34}
          borderRadius={21}
          backgroundColor={followupActive ? "$primary" : "$background"}
          alignItems="center"
          justifyContent="center"
          onPress={handleFollowupTabPress}
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
            color={followupActive ? "white" : "#666"}
            fontWeight="600"
            fontSize={14}
          >
            Followup
          </Text>
        </XStack>
      </XStack>

      {/* Content */}
      <ScreenScrollView onRefresh={handleRefresh}>
        {renderContent()}
      </ScreenScrollView>

      {/* FAB - Only show for Inquiry module */}
      {!followupActive && activeModuleType === "inquiry" && activeModuleId && (
        <AddFormButton component={<AddInquiryForm />} title="Add Inquiry" />
      )}

      {/* FAB - Show for Followup tab */}
      {followupActive && (
        <AddFormButton component={<AddFollowupForm />} title="Add Followup" />
      )}
    </YStack>
  );
}
