import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { requestAllPermissions as requestAllNativePermissions } from "../../../utils/permissions";
import { PermissionResults } from "../types";

// Deliberately a plain AsyncStorage key rather than persisted redux state:
// persistor.purge() runs on auth failure and the root reducer resets every
// slice on logout, either of which would resurrect the first-run flow.
const PERMISSIONS_REQUESTED_KEY = "permissions_requested";

export const checkPermissionsAsked = createAsyncThunk(
  "permissions/checkPermissionsAsked",
  async () => {
    const asked = await AsyncStorage.getItem(PERMISSIONS_REQUESTED_KEY);
    return asked === "true";
  },
);

export const requestAllPermissions = createAsyncThunk(
  "permissions/requestAllPermissions",
  async (): Promise<PermissionResults> => {
    try {
      return await requestAllNativePermissions();
    } finally {
      // Written in `finally` so a native module blowing up can never strand the
      // user on the priming screen with no way forward.
      await AsyncStorage.setItem(PERMISSIONS_REQUESTED_KEY, "true");
    }
  },
);
