import { ComponentType, ReactNode, useCallback, useEffect } from "react";
import { Spinner, Text, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { ScreenScrollView } from "../../../../components/workspace/screen-scroll-view";
import { AddFormButton } from "../../components/custom/buttons/addFormButton";
import {
  clearCustomers,
  setActiveModule,
} from "../features/ccd/store/ccd.slice";
import { fetchModules } from "../features/ccd/store/ccd.thunks";
import { AddInquiryForm } from "./AddForm/add-inquiry-form";
import { CCDInquiryScreen } from "./ccd-inquiry";
import { CCDPsfScreen } from "./ccd-psf";
import { CCDRetailScreen } from "./ccd-retail";

export type CCDModuleType = "inquiry" | "retail" | "psf";

const SCREENS: Record<CCDModuleType, ComponentType<{ moduleId: number }>> = {
  inquiry: CCDInquiryScreen,
  retail: CCDRetailScreen,
  psf: CCDPsfScreen,
};

const TITLES: Record<CCDModuleType, string> = {
  inquiry: "Inquiry",
  retail: "Retail",
  psf: "PSF",
};

const Center = ({ children }: { children: ReactNode }) => (
  <YStack
    flex={1}
    alignItems="center"
    justifyContent="center"
    paddingTop="$10"
  >
    {children}
  </YStack>
);

/**
 * One CCD module rendered as its own screen. The module id is resolved from the
 * module_type, so each route only shows its own module (no shared tab bar).
 */
export function CCDModulePage({ moduleType }: { moduleType: CCDModuleType }) {
  const dispatch = useAppDispatch();
  const { modules, activeModuleId, loading } = useAppSelector(
    (state) => state.crmCcd,
  );

  const target = modules.find((m) => m.module_type === moduleType);

  useEffect(() => {
    dispatch(fetchModules());
    return () => {
      dispatch(clearCustomers());
    };
  }, [dispatch]);

  useEffect(() => {
    if (target && target.id !== activeModuleId) {
      dispatch(setActiveModule(target.id));
    }
  }, [target, activeModuleId, dispatch]);

  const handleRefresh = useCallback(async () => {
    await dispatch(fetchModules());
  }, [dispatch]);

  if (loading && modules.length === 0) {
    return (
      <Center>
        <Spinner size="large" color="$primary" />
        <Text marginTop="$4">Loading modules...</Text>
      </Center>
    );
  }

  if (!target) {
    return (
      <Center>
        <Text color="$secondaryText">
          No {TITLES[moduleType]} module available
        </Text>
      </Center>
    );
  }

  // Wait until the slice points at this module so the previous module's rows
  // don't flash before the fetch replaces them.
  if (activeModuleId !== target.id) {
    return (
      <Center>
        <Spinner size="large" color="$primary" />
        <Text marginTop="$4">Loading module...</Text>
      </Center>
    );
  }

  const Screen = SCREENS[moduleType];

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView onRefresh={handleRefresh}>
        <Screen moduleId={target.id} />
      </ScreenScrollView>

      {moduleType === "inquiry" && (
        <AddFormButton component={<AddInquiryForm />} title="Add Inquiry" />
      )}
    </YStack>
  );
}
