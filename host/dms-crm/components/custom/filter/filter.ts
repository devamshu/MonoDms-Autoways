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

// components/custom/filter/filter.ts
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
  // Page-at-a-time loader for option sets too large to fetch up front. The
  // picker calls it again as the list is scrolled, until `hasMore` is false.
  paginatedOptionsLoader?: (page: number) => Promise<{
    options: { label: string; value: any }[];
    hasMore: boolean;
  }>;
  defaultValue?: any;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  visible?: (filters: Record<string, any>) => boolean;
  // Add these missing properties
  transform?: (value: any) => any; // Transform value before API call
  apiField?: string; // Map to different API field name
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
}

export interface AppliedFilter {
  fieldId: string;
  value: any;
  operator: FilterOperator;
  displayValue: string;
}
