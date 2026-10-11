export interface UserGroup {
  id: number;
  name: string;
}

export interface UserProfile {
  id: number;
  username: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  employee_id?: number | null;
  is_superuser?: boolean;
  groups?: UserGroup[];
  authorities?: string[];
  // Full Django codenames (e.g. "change_inquiry") grouped by model, as returned
  // by GET /users/auth/me/. Same source the web permission engine reads.
  permissions?: Record<string, string[]>;
}

export interface ChangePassword {
  old_password: string;
  new_password: string;
  re_new_password: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  status: string;
  message: string;
  data: null | any;
}

export interface ProfileResponse {
  status: string;
  data: UserProfile;
}

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
}
