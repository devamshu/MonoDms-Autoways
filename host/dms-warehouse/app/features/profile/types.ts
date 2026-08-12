export interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  image: string | null;
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
