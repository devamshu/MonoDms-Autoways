import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type WorkspaceName = "crm" | "warehouse" | "management";

interface WorkspaceState {
  activeWorkspace: WorkspaceName;
}

const initialState: WorkspaceState = {
  activeWorkspace: "crm",
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspace: (state, action: PayloadAction<WorkspaceName>) => {
      state.activeWorkspace = action.payload;
    },
  },
});

export const { setActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
