import { createSlice } from "@reduxjs/toolkit";
import { PermissionsState } from "../types";
import {
  checkPermissionsAsked,
  requestAllPermissions,
} from "./permissions.thunks";

const initialState: PermissionsState = {
  hasAsked: false,
  isChecking: true,
  isRequesting: false,
  results: {
    camera: "undetermined",
    photos: "undetermined",
  },
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Read the persisted flag on boot
      .addCase(checkPermissionsAsked.pending, (state) => {
        state.isChecking = true;
      })
      .addCase(checkPermissionsAsked.fulfilled, (state, action) => {
        state.isChecking = false;
        state.hasAsked = action.payload;
      })
      .addCase(checkPermissionsAsked.rejected, (state) => {
        // A failed read must not trap the user on the priming screen forever,
        // but it also must not skip a genuine first run. Treat it as "not yet
        // asked" — the flow is idempotent, so the worst case is asking again.
        state.isChecking = false;
        state.hasAsked = false;
      })

      // Run the native dialogs
      .addCase(requestAllPermissions.pending, (state) => {
        state.isRequesting = true;
      })
      .addCase(requestAllPermissions.fulfilled, (state, action) => {
        state.isRequesting = false;
        state.hasAsked = true;
        state.results = action.payload;
      })
      .addCase(requestAllPermissions.rejected, (state) => {
        // The thunk writes the flag in a `finally`, so it is set on disk even
        // here. Mirror that, or the gate and the store would disagree — and the
        // user would sit on the loading screen forever.
        state.isRequesting = false;
        state.hasAsked = true;
      });
  },
});

export default permissionsSlice.reducer;
