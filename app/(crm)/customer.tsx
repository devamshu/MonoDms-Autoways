import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { ScreenScrollView } from "@/components/workspace/screen-scroll-view";
import { AddCustomerForm } from "@/host/dms-crm/app/customer/AddForm/add-customer-form";
import { CustomerActionDrawer } from "@/host/dms-crm/app/customer/viewDetail/CustomerActionDrawer";
import type { Customer } from "@/host/dms-crm/app/features/customer/types";
import { fetchCustomers } from "@/host/dms-crm/app/features/customer/store/customer.thunks";
import { AddFormButton } from "@/host/dms-crm/components/custom/buttons/addFormButton";
import { getCustomerColumns } from "@/host/dms-crm/components/custom/columns/customer.columns";
import { useFilters } from "@/host/dms-crm/components/custom/filter/filterContext";
import { buildTableApiParams } from "@/host/dms-crm/components/custom/table/buildFetchParams";
import { TableMain } from "@/host/dms-crm/components/custom/table/main";
import { FetchParams } from "@/host/dms-crm/components/custom/table/types";
import { useCallback, useRef, useState } from "react";
import { YStack } from "tamagui";

export default function CustomerScreen() {
  const dispatch = useAppDispatch();
  const { customers, count, loading } = useAppSelector(
    (state) => state.crmCustomer,
  );

  const { activeFilters } = useFilters();
  const tableRef = useRef<any>(null);

  // The customer whose action drawer is open. Opening the drawer keeps the
  // list mounted underneath, so filters/search/page/scroll are preserved.
  const [actionCustomer, setActionCustomer] = useState<Customer | null>(null);

  const handleCustomerPress = useCallback(
    (id: string) => {
      const row = customers.find((c) => String(c.id) === id) ?? null;
      setActionCustomer(row);
    },
    [customers],
  );

  const columns = getCustomerColumns(handleCustomerPress);

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
          defaultVisibleColumns={["sn", "name", "kind_name", "is_converted_to_deal"]}
          showCard
        />
      </ScreenScrollView>
      <AddFormButton component={<AddCustomerForm />} title="Add Inquiry" />
      <CustomerActionDrawer
        open={!!actionCustomer}
        onClose={() => setActionCustomer(null)}
        customer={actionCustomer}
      />
    </YStack>
  );
}
