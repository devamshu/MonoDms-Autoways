import { useAppDispatch } from "@/app/features/hooks";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { AddFollowupForm } from "@/host/dms-crm/app/ccd/AddForm/add-followup-form";
import { CCDFollowupScreen } from "@/host/dms-crm/app/ccd/ccd-followup";
import { fetchFollowups } from "@/host/dms-crm/app/features/ccd/store/ccd.thunks";
import { AddFormButton } from "@/host/dms-crm/components/custom/buttons/addFormButton";
import { useCallback } from "react";
import { YStack } from "tamagui";

export default function FollowupScreen() {
  const dispatch = useAppDispatch();

  const handleRefresh = useCallback(async () => {
    await dispatch(fetchFollowups());
  }, [dispatch]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView onRefresh={handleRefresh}>
        <CCDFollowupScreen />
      </ScreenScrollView>
      <AddFormButton component={<AddFollowupForm />} title="Add Followup" />
    </YStack>
  );
}
