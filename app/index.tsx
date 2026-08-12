import { useEffect, useRef } from "react";
import { Spinner, Text, View, YStack } from "tamagui";
import { checkAuthStatus } from "./features/auth/store/auth.thunks";
import { useAppDispatch, useAppSelector } from "./features/hooks";
import {
  checkPermissionsAsked,
  requestAllPermissions,
} from "./features/permissions/store/permissions.thunks";
import { RootState } from "./features/store";
import { AppRoutes, navigate } from "./utils/navigation";

export default function RootScreen() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isCheckingAuth } = useAppSelector(
    (state: RootState) => state.auth,
  );
  const { hasAsked, isChecking: isCheckingPermissions } = useAppSelector(
    (state: RootState) => state.permission,
  );
  // The native dialogs must only ever be kicked off once per mount. Without
  // this the effect could re-enter and queue a second round of prompts.
  const hasStartedPermissions = useRef(false);

  useEffect(() => {
    const initializeApp = async () => {
      await dispatch(checkPermissionsAsked());
      await dispatch(checkAuthStatus());
    };
    initializeApp();
  }, [dispatch]);

  useEffect(() => {
    // Wait for the permissions flag to be read too — `hasAsked` starts out
    // false, so acting before the read lands would re-prompt a user who has
    // already been through this.
    if (isCheckingAuth || isCheckingPermissions) return;

    if (!hasAsked) {
      // First launch: fire the native permission dialogs over this loading
      // screen. Once the thunk settles it flips `hasAsked`, which re-runs this
      // effect and falls through to the routing below.
      //
      // Whatever the user answers, this never runs again — a refusal is picked
      // back up at the point the feature is actually used, which is where the
      // ask has context (see ensurePermissionOrPrompt).
      if (!hasStartedPermissions.current) {
        hasStartedPermissions.current = true;
        dispatch(requestAllPermissions());
      }
      return;
    }

    navigate.replace(
      isAuthenticated ? AppRoutes.APP_SELECTION : AppRoutes.LOGIN,
    );
  }, [
    isCheckingAuth,
    isCheckingPermissions,
    isAuthenticated,
    hasAsked,
    dispatch,
  ]);

  // Loading screen
  return (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
    >
      <YStack gap="$2" alignItems="center">
        <Spinner size="large" color="$secondary" />
        <Text fontSize={16} color="$secondaryText">
          Loading...
        </Text>
      </YStack>
    </View>
  );
}
