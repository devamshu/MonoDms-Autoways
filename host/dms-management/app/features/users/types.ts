export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  last_activity: string | null;
  failed_login_attempts: number;
  last_ip_address: string | null;
  dealer: number | null;
  employee: number | null;
  groups: UserGroup[];
}

export interface UserGroup {
  id: number;
  name: string;
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type UsersListResponse = PaginatedResponse<User>;

export interface UsersListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  is_dealer_user?: string;
}

export interface UserDetailScreenProps {
  id: string;
  onBack?: () => void;
}
