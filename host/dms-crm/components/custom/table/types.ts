export interface Column {
  id: string;
  label: string;
  accessor: string;
  sortable?: boolean;
  sortKey?: string;
  width?: number | "auto" | "fit";
  align?: "left" | "center" | "right";
  render?: (value: any, row: any, index?: number) => React.ReactNode;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TableProps {
  columns: Column[];
  data: any[];
  keyExtractor?: (item: any) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowPress?: (row: any) => void;
  onSort?: (columnId: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

export interface ManageColumnsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  visibleColumns: string[];
  columnOrder: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
  onColumnOrderChange: (order: string[]) => void;
  onReset?: () => void;
  onApply?: (visibleColumns: string[], columnOrder: string[]) => void;
}

export interface PaginationControlsProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
}

export interface TableMainProps {
  // Data props
  columns: Column[];
  data: any[];
  totalItems: number;

  // API callbacks
  onFetchData: (params: FetchParams) => Promise<void>;

  // Feature toggles
  enableSearch?: boolean;
  enablePagination?: boolean;
  enableColumnManagement?: boolean;
  enableSorting?: boolean;

  // Search config
  searchPlaceholder?: string;
  searchDebounceMs?: number;

  // Pagination config
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];

  // Table config
  keyExtractor?: (item: any) => string | number;
  onRowPress?: (row: any) => void;
  emptyMessage?: string;
  isLoading?: boolean;

  // Column management config
  defaultVisibleColumns?: string[];
  persistColumnConfig?: boolean; // Save to localStorage/AsyncStorage

  // UI props
  showCard?: boolean;
}

export interface FetchParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
