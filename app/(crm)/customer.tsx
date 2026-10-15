import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { AddCustomerForm } from "@/host/dms-crm/app/customer/AddForm/add-customer-form";
import { CustomerActionScreen } from "@/host/dms-crm/app/customer/viewDetail/CustomerActionScreen";
import { fetchCustomers } from "@/host/dms-crm/app/features/customer/store/customer.thunks";
import { AddFormButton } from "@/host/dms-crm/components/custom/buttons/addFormButton";
import { getCustomerColumns } from "@/host/dms-crm/components/custom/columns/customer.columns";
import { useFilters } from "@/host/dms-crm/components/custom/filter/filterContext";
import { buildTableApiParams } from "@/host/dms-crm/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-crm/components/custom/table/main";
import { FetchParams } from "@/host/dms-crm/components/custom/table/types";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { YStack } from "tamagui";

const keyExtractor = (item: any) =>
  item?.id?.toString() ?? Math.random().toString();

export default function CustomerScreen() {
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

  const columns = useMemo(
    () => getCustomerColumns(handleCustomerPress),
    [handleCustomerPress],
  );

  const fetchData = useCallback(
    async (params: FetchParams) => {
      dispatch(
        fetchCustomers({
          ...buildTableApiParams(params, activeFilters),
          is_booked: "false",
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
          searchPlaceholder="Search Inquiry..."
          itemsPerPage={10}
          itemsPerPageOptions={[10, 25, 50]}
          keyExtractor={keyExtractor}
          emptyMessage="No customers found"
          isLoading={loading}
          defaultVisibleColumns={[
            "sn",
            "inq_no",
            "name",
            "contact",
            "contact_person",
            "inquiry_date",
            "kind_name",
            "status",
            "assigned_to_name",
          ]}
          showCard
        />
      </ScreenScrollView>
      <AddFormButton component={<AddCustomerForm />} title="Add Inquiry" />
    </YStack>
  );
}
