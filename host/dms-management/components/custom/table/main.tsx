import AsyncStorage from "@react-native-async-storage/async-storage";
import { Columns3 } from "lucide-react-native";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button, Card, XStack, YStack } from "tamagui";
import { ManageColumns } from "./manage";
import { PaginationControls } from "./pagination";
import { SearchInput } from "./search";
import { Table } from "./table";
import { Column, PaginationState, TableMainProps } from "./types";

const STORAGE_KEY = "table_column_config";

export interface TableMainHandle {
  refresh: () => void;
  reset: () => void;
  getCurrentState: () => {
    page: number;
    limit: number;
    search: string;
    sortColumn: string;
    sortDirection: "asc" | "desc";
  };
}

export const TableMain = forwardRef<TableMainHandle, TableMainProps>(
  (props, ref) => {
    const {
      // Data props
      columns,
      data,
      totalItems,

      // API callbacks
      onFetchData,

      // Feature toggles
      enableSearch = true,
      enablePagination = true,
      enableColumnManagement = true,
      enableSorting = true,

      // Search config
      searchPlaceholder = "Search...",
      searchDebounceMs = 500,

      // Pagination config
      itemsPerPage = 10,
      itemsPerPageOptions = [10, 25, 50, 100],

      // Table config
      keyExtractor,
      onRowPress,
      emptyMessage = "No data available",
      isLoading = false,

      // Column management config
      defaultVisibleColumns,
      persistColumnConfig = false,

      // UI props
      showCard = true,
    } = props;

    // State
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentItemsPerPage, setCurrentItemsPerPage] =
      useState(itemsPerPage);
    const [sortColumn, setSortColumn] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(
      defaultVisibleColumns || columns.map((col) => col.id),
    );
    const [columnOrder, setColumnOrder] = useState<string[]>(
      columns.map((col) => col.id),
    );

    // Derived pagination — no sync effect needed
    const totalPages = Math.max(1, Math.ceil(totalItems / currentItemsPerPage));
    const pagination: PaginationState = {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: currentItemsPerPage,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
    };

    // Keep refs for values used inside fetchData so the callback can stay
    // stable without reading potentially-stale state.
    const fetchDataRef = useRef({
      currentPage,
      currentItemsPerPage,
      searchValue,
      sortColumn,
      sortDirection,
    });
    fetchDataRef.current = {
      currentPage,
      currentItemsPerPage,
      searchValue,
      sortColumn,
      sortDirection,
    };

    // Keep a ref to onFetchData so fetchData never needs it as a dep.
    const onFetchDataRef = useRef(onFetchData);
    onFetchDataRef.current = onFetchData;

    // Read columns through a ref so fetchData stays stable. `columns` is only
    // used to resolve a sort key; if it were a dep, every new columns identity
    // (e.g. after each fetch rebuilds the array) would retrigger the fetch
    // effect below and cause an infinite refetch loop.
    const columnsRef = useRef(columns);
    columnsRef.current = columns;

    // Fetch data when user-controlled filters change
    const fetchData = useCallback(() => {
      const {
        currentPage,
        currentItemsPerPage,
        searchValue,
        sortColumn,
        sortDirection,
      } = fetchDataRef.current;
      const resolvedSortBy =
        enableSorting && sortColumn
          ? (columnsRef.current.find((col) => col.id === sortColumn)?.sortKey ??
            sortColumn)
          : undefined;
      onFetchDataRef.current({
        page: currentPage,
        limit: currentItemsPerPage,
        search: enableSearch ? searchValue : undefined,
        sortBy: resolvedSortBy,
        sortOrder: enableSorting && sortColumn ? sortDirection : undefined,
      });
    }, [enableSearch, enableSorting]);

    // Refetch whenever a user-controlled filter/pagination value changes.
    // fetchData reads the latest values from fetchDataRef (reassigned during
    // render, before this effect runs), so depending on the state values here
    // is what actually triggers the fetch — fetchData's identity is stable.
    useEffect(() => {
      fetchData();
    }, [
      currentPage,
      currentItemsPerPage,
      searchValue,
      sortColumn,
      sortDirection,
      fetchData,
    ]);

    // Reset page if totalPages shrinks below currentPage
    useEffect(() => {
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }, [totalPages, currentPage]);

    // Load persisted column config
    useEffect(() => {
      if (!persistColumnConfig) return;

      const loadColumnConfig = async () => {
        try {
          const config = await AsyncStorage.getItem(STORAGE_KEY);
          if (config) {
            const { visible, order } = JSON.parse(config);
            setVisibleColumns(visible);
            setColumnOrder(order);
          }
        } catch (error) {
          console.error("Failed to load column config:", error);
        }
      };

      loadColumnConfig();
    }, [persistColumnConfig]);

    const saveColumnConfig = async (visible: string[], order: string[]) => {
      if (!persistColumnConfig) return;
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ visible, order }),
        );
      } catch (error) {
        console.error("Failed to save column config:", error);
      }
    };

    const handleVisibleColumnsChange = (cols: string[]) => {
      setVisibleColumns(cols);
      saveColumnConfig(cols, columnOrder);
    };

    const handleColumnOrderChange = (order: string[]) => {
      setColumnOrder(order);
      saveColumnConfig(visibleColumns, order);
    };

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newLimit: number) => {
      setCurrentItemsPerPage(newLimit);
      setCurrentPage(1);
    };

    const handleSearchChange = useCallback((value: string) => {
      setSearchValue(value);
      setCurrentPage(1);
    }, []);

    const handleSort = (columnId: string, direction: "asc" | "desc") => {
      setSortColumn(columnId);
      setSortDirection(direction);
      setCurrentPage(1);
    };

    const handleReset = () => {
      setSearchValue("");
      setSortColumn("");
      setSortDirection("asc");
      setCurrentPage(1);
    };

    // Get ordered and filtered columns
    const getDisplayColumns = (): Column[] => {
      const ordered = columnOrder
        .filter((id) => visibleColumns.includes(id))
        .map((id) => columns.find((col) => col.id === id))
        .filter((col) => col) as Column[];

      return ordered;
    };

    const displayColumns = getDisplayColumns();

    // Expose refresh method to parent component
    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchDataRef.current = {
          ...fetchDataRef.current,
          // Force current values so fetchData picks up latest
        };
        onFetchDataRef.current({
          page: fetchDataRef.current.currentPage,
          limit: fetchDataRef.current.currentItemsPerPage,
          search: enableSearch ? fetchDataRef.current.searchValue : undefined,
          sortBy:
            enableSorting && fetchDataRef.current.sortColumn
              ? fetchDataRef.current.sortColumn
              : undefined,
          sortOrder:
            enableSorting && fetchDataRef.current.sortColumn
              ? fetchDataRef.current.sortDirection
              : undefined,
        });
      },
      reset: () => {
        handleReset();
      },
      getCurrentState: () => ({
        page: fetchDataRef.current.currentPage,
        limit: fetchDataRef.current.currentItemsPerPage,
        search: fetchDataRef.current.searchValue,
        sortColumn: fetchDataRef.current.sortColumn,
        sortDirection: fetchDataRef.current.sortDirection,
      }),
    }));

    const content = (
      <YStack gap="$4" backgroundColor="$background" flex={1}>
        {/* Header with Search and Controls */}
        <XStack gap={8} alignItems="center">
          {enableSearch && (
            <XStack flex={1}>
              <SearchInput
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                debounceMs={searchDebounceMs}
              />
            </XStack>
          )}

          {enableColumnManagement && (
            <Button
              width={40}
              height={50}
              icon={<Columns3 size={16} pointerEvents="none" />}
              borderWidth={1}
              borderColor="$inputBorderColor"
              backgroundColor="$background"
              onPress={() => setManageColumnsOpen(true)}
            />
          )}
        </XStack>

        {/* Manage Columns Panel */}
        {enableColumnManagement && (
          <ManageColumns
            open={manageColumnsOpen}
            onOpenChange={setManageColumnsOpen}
            columns={columns}
            visibleColumns={visibleColumns}
            columnOrder={columnOrder}
            onVisibleColumnsChange={handleVisibleColumnsChange}
            onColumnOrderChange={handleColumnOrderChange}
            onReset={() => {
              const allColumnIds = columns.map((col) => col.id);
              handleVisibleColumnsChange(allColumnIds);
              handleColumnOrderChange(allColumnIds);
            }}
          />
        )}

        <YStack flex={1} width="100%">
          {/* Table */}
          <Table
            columns={displayColumns}
            data={data}
            keyExtractor={keyExtractor}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            onRowPress={onRowPress}
            onSort={enableSorting ? handleSort : undefined}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          {enablePagination && (
            <PaginationControls
              pagination={pagination}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={itemsPerPageOptions}
              showItemsPerPage={true}
            />
          )}
        </YStack>
      </YStack>
    );

    if (showCard) {
      return <Card>{content}</Card>;
    }

    return content;
  },
);

TableMain.displayName = "TableMain";
