import { createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../../utils/extractError";
import { usersApi } from "../api/users.api";
import { User, UsersListParams, UsersListResponse } from "../types";

export const fetchUsers = createAsyncThunk<
  UsersListResponse,
  UsersListParams | undefined,
  { rejectValue: string }
>("users/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const response = await usersApi.fetchUsers(params);
    console.log("[fetchUsers thunk] params:", params);
 
    if (response.success && response.data) {
      return response.data;
    }

    return rejectWithValue(response.message || "Failed to fetch users");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("users/fetchUserById", async (id, { rejectWithValue }) => {
  try {
    const response = await usersApi.fetchUserById(id);
    if (response.success && response.data) return response.data;
    return rejectWithValue(response.message || "Failed to fetch user");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
