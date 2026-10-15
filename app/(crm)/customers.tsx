import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { CustomerActionScreen } from "@/host/dms-crm/app/customer/viewDetail/CustomerActionScreen";
import { fetchCustomers } from "@/host/dms-crm/app/features/customer/store/customer.thunks";
import { getCustomerColumns } from "@/host/dms-crm/components/custom/columns/customer.columns";
import { useFilters } from "@/host/dms-crm/components/custom/filter/filterContext";
import { buildTableApiParams } from "@/host/dms-crm/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-crm/components/custom/table/main";
import { FetchParams } from "@/host/dms-crm/components/custom/table/types";
import { useCallback, useEffect, useRef } from "react";
import { YStack } from "tamagui";

export default function CustomersScreen() {
  const dispatch = useAppDispatch();
  const { customers, count, loading } = useAppSelector(
    (state) => state.crmCustomer,
  );

  const { activeFilters } = useFilters();
  const { open } = useSlideOpen();
  const tableRef = useRef<any>(null);

  const handleCustomerPress = useCallback(
    (id: string) => {
      const row = customers.find((c) => String(c.id) === id);
      if (!row) return;
      open(
        <CustomerActionScreen
          customer={row}
          onChanged={() => tableRef.current?.refresh()}
        />,
        row.name ?? "Customer",
      );
    },
    [customers, open],
  );

  const columns = getCustomerColumns(handleCustomerPress);

  const fetchData = useCallback(
    async (params: FetchParams) => {
      const { customer_status, ...filters } = activeFilters;
      const isSold =
        customer_status === "sold"
          ? "true"
          : customer_status === "booked"
            ? "false"
            : undefined;
      dispatch(
        fetchCustomers({
          ...buildTableApiParams(params, filters),
          is_booked: "true",
          ...(isSold ? { is_sold: isSold } : {}),
        }),
      );
    },
    [dispatch, activeFilters],
  );

  const previousFiltersJson = useRef<string | null>(null);
  useEffect(() => {
    const json = JSON.stringify(activeFilters);
    if (previousFiltersJson.current === null) {
      previousFiltersJson.current = json;
      return;
    }
    if (previousFiltersJson.current === json) return;
    previousFiltersJson.current = json;
    tableRef.current?.refresh();
  }, [activeFilters]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScreenScrollView onRefresh={() => tableRef.current?.refresh()}>
        <TableMain
          ref={tableRef}
          columns={columns}
          data={customers}
          totalItems={count}
          onFetchData={fetchData}
          enableSearch
          enablePagination
          enableColumnManagement
          enableSorting
          searchPlaceholder="Search customers..."
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50]}
          keyExtractor={(item) => {
            return item?.id?.toString() ?? Math.random().toString();
          }}
          emptyMessage="No customers found"
          isLoading={loading}
          defaultVisibleColumns={[
            "sn",
            "inq_no",
            "name",
            "contact",
            "contact_person",
            "dealer_name",
            "vehicle",
            "deal_amount",
            "booking_amount",
            "total_payments_made",
            "booking_approved_at",
            "status",
            "assigned_to_name",
          ]}
          showCard
        />
      </ScreenScrollView>
    </YStack>
  );
}
