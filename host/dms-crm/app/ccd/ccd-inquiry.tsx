import { useCallback, useMemo } from "react";
import { Text, YStack } from "tamagui";
import { useAppDispatch, useAppSelector } from "../../../../app/features/hooks";
import { useSlideOpen } from "../../../../components/auth/slideOpen";
import {
  applyServerColumnMeta,
  getCcdInquiryColumns,
  transformInquiryRows
} from "../../components/custom/columns/ccd.columns";
import { buildTableApiParams } from "../../components/custom/table/buildFetchParams";
import { TableMain } from "../../components/custom/table/main";
import { Column, FetchParams } from "../../components/custom/table/types";
import { fetchModuleCustomers } from "../features/ccd/store/ccd.thunks";
import { formatValue } from "../utils/validator/emptyFieldValidator";
import { CCDInquiryDetailScreen } from "./ViewDetail/inquiry-detail";

interface CCDInquiryScreenProps {
  moduleId: number;
}

export function CCDInquiryScreen({ moduleId }: CCDInquiryScreenProps) {
  const dispatch = useAppDispatch();
  const { customers, moduleSettings, count, actionLoading } = useAppSelector(
    (state) => state.crmCcd,
  );
  const { open } = useSlideOpen();

  const handleOpenDetail = useCallback(
    (id: string) => {
      open(<CCDInquiryDetailScreen id={id} />, "Inquiry Details");
    },
    [open],
  );

  const handleRowPress = useCallback(
    (row: any) => handleOpenDetail(row.id.toString()),
    [handleOpenDetail],
  );

  const transformedData = useMemo(
    () => transformInquiryRows(customers),
    [customers],
  );

  const columns = useMemo(() => {
    const baseColumns: Column[] = [
      {
        id: "sn",
        label: "SN",
        accessor: "sn",
        width: 60,
        align: "center",
        render: (value: number) => (
          <Text fontWeight="500" numberOfLines={1} color="$color">
            {formatValue(value)}
          </Text>
        ),
      },
    ];

    if (
      moduleSettings?.table_columns &&
      moduleSettings.table_columns.length > 0
    ) {
      const dynamicColumns: Column[] = moduleSettings.table_columns.map(
        (col) => {
          let accessor = col.field;
          let renderFunction;

          if (col.field === "created_date") {
            accessor = "formatted_created_date";
            renderFunction = (value: any) => (
              <Text numberOfLines={1} color="$color">
                {formatValue(value)}
              </Text>
            );
          } else if (col.field === "inq_no") {
            renderFunction = (value: any) => (
              <Text numberOfLines={1} color="$primary" fontWeight="500">
                {formatValue(value)}
              </Text>
            );
          } else {
            renderFunction = (value: any) => (
              <Text numberOfLines={1} color="$color">
                {formatValue(value)}
              </Text>
            );
          }

          return {
            id: col.field,
            label: col.header,
            accessor: accessor,
            sortable: col.sortable,
            sortKey: col.field,
            width: col.type === "datetime" || col.type === "date" ? 160 : 180,
            render: renderFunction,
          };
        },
      );
      return [...baseColumns, ...dynamicColumns];
    }

    return applyServerColumnMeta(
      getCcdInquiryColumns(),
      moduleSettings?.table_columns,
    );
  }, [moduleSettings]);

  const defaultOrdering = moduleSettings?.metadata?.default_sort;

  const handleFetchData = useCallback(
    async (params: FetchParams) => {
      await dispatch(
        fetchModuleCustomers({
          moduleId,
          params: buildTableApiParams(params, undefined, defaultOrdering),
        }),
      );
    },
    [dispatch, moduleId, defaultOrdering],
  );

  return (
    <YStack flex={1}>
      <TableMain
        key={moduleId}
        columns={columns}
        data={transformedData}
        totalItems={count}
        onFetchData={handleFetchData}
        isLoading={actionLoading}
        emptyMessage="No inquiry data found"
        keyExtractor={(item) => item.id.toString()}
        onRowPress={handleRowPress}
        searchPlaceholder={"Search CCD Inquiry"}
        itemsPerPage={5}
        itemsPerPageOptions={[5, 10, 25, 50]}
        enableSearch
        enablePagination
        enableColumnManagement
        enableSorting
        showCard={false}
      />
    </YStack>
  );
}
