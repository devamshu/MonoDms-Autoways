// src/components/custom/filter/filter.ts
export type FilterOperator =
  | "equals"
  | "contains"
  | "in"
  | "between"
  | "gte"
  | "lte"
  | "startsWith"
  | "endsWith";

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface FilterField {
  id: string;
  label: string;
  type:
    | "select"
    | "search-select"
    | "multi-select"
    | "radio"
    | "date-range"
    | "text"
    | "number";
  placeholder?: string;
  options?: { label: string; value: any }[];
  optionsLoader?: () => Promise<{ label: string; value: any }[]>;
  // Alternative to optionsLoader for backend-paginated option lists: called
  // with the page to fetch, returns the full accumulated option list so far
  // plus whether more pages remain. When set, the dropdown fetches the next
  // page automatically as the user scrolls to the end of the list.
  paginatedOptionsLoader?: (page: number) => Promise<{
    options: { label: string; value: any }[];
    hasMore: boolean;
  }>;
  defaultValue?: any;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  visible?: (filters: Record<string, any>) => boolean;
  transform?: (value: any) => any;
  apiField?: string;
  operator?:
    | "equals"
    | "contains"
    | "in"
    | "between"
    | "gte"
    | "lte"
    | "startsWith"
    | "endsWith";
}

export interface FilterConfig {
  title: string;
  fields: FilterField[];
  persistKey?: string;
  drawerHeight?: number;
}

export interface AppliedFilter {
  fieldId: string;
  value: any;
  operator: FilterOperator;
  displayValue: string;
}
