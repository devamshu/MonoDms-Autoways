import { createSlice } from "@reduxjs/toolkit";
import { User } from "../types";
import { fetchUserById, fetchUsers } from "./users.thunk";

interface UsersState {
  users: User[];
  count: number;
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
}

const initialState: UsersState = {
  users: [],
  count: 0,
  next: null,
  previous: null,
  loading: false,
  error: null,
  selectedUser: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.count = 0;
      state.next = null;
      state.previous = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.results;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });

    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.selectedUser = null;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export const { clearUsers } = usersSlice.actions;
export default usersSlice.reducer;
