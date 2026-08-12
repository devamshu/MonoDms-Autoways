import { useAppDispatch, useAppSelector } from "@/app/features/hooks";
import { useSlideOpen } from "@/components/auth/slideOpen";
import { useScreenRefresh } from "@/components/workspace/useScreenRefresh";
import { CCDInquiryDetailScreen } from "@/host/dms-crm/app/ccd/ViewDetail/inquiry-detail";
import { CCDPsfDetailScreen } from "@/host/dms-crm/app/ccd/ViewDetail/psf-detail";
import { CCDRetailDetailScreen } from "@/host/dms-crm/app/ccd/ViewDetail/retail-detail";
import { CustomerDetailScreen } from "@/host/dms-crm/app/customer/viewDetail/CustomerDetailScreen";
import { ccdApi } from "@/host/dms-crm/app/features/ccd/api/ccd.api";
import { fetchModules } from "@/host/dms-crm/app/features/ccd/store/ccd.thunks";
import { customerApi } from "@/host/dms-crm/app/features/customer/api/customer.api";
import { fetchCrmSummary } from "@/host/dms-crm/app/features/dashboard/store/dashboard.thunk";
import {
  getCcdInquiryColumns,
  getCcdPsfColumns,
  getCcdRetailColumns,
  transformInquiryRows,
  transformPsfRows,
  transformRetailRows,
} from "@/host/dms-crm/components/custom/columns/ccd.columns";
import { getCustomerColumns } from "@/host/dms-crm/components/custom/columns/customer.columns";
import { SectionHeader } from "@/host/dms-crm/components/custom/dashboard/sectionHeader";
import { StatsCard } from "@/host/dms-crm/components/custom/dashboard/statsCard";
import {
  TableMain,
  TableMainHandle,
} from "@/host/dms-crm/components/custom/table/main";
import { router } from "expo-router";
import { Users } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, useTheme, YStack } from "tamagui";

export default function HomeScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { open } = useSlideOpen();

  const { crmSummary } = useAppSelector((state) => state.crmDashboard);
  const { modules } = useAppSelector((state) => state.crmCcd);

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerLoading, setCustomerLoading] = useState(true);

  const customerSearchRef = useRef<string | undefined>(undefined);
  const ccdSearchRef = useRef<{
    inquiry?: string;
    retail?: string;
    psf?: string;
  }>({});

  const inquiryTableRef = useRef<TableMainHandle>(null);
  const retailTableRef = useRef<TableMainHandle>(null);
  const psfTableRef = useRef<TableMainHandle>(null);

  const [inquiryRows, setInquiryRows] = useState<any[]>([]);
  const [retailRows, setRetailRows] = useState<any[]>([]);
  const [psfRows, setPsfRows] = useState<any[]>([]);
  const [ccdLoading, setCcdLoading] = useState({
    inquiry: true,
    retail: true,
    psf: true,
  });

  const loadCustomers = useCallback(async (search?: string) => {
    setCustomerLoading(true);
    try {
      const res = await customerApi.fetchCustomers({
        page: 1,
        page_size: 5,
        search,
      });
      setCustomers(res.success && res.data ? res.data.results : []);
    } catch (e) {
      console.error("Failed to load customer preview", e);
      setCustomers([]);
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchCrmSummary());
    dispatch(fetchModules());
  }, [dispatch]);

  const modulesLoaded = modules.length > 0;

  const moduleIds = useMemo(() => {
    const idOf = (type: string) =>
      modules.find((m) => m.module_type === type)?.id;
    return {
      inquiry: idOf("inquiry"),
      retail: idOf("retail"),
      psf: idOf("psf"),
    };
  }, [modules]);

  // Module IDs resolve asynchronously after fetchModules() completes, and
  // TableMain's fetch effect only reacts to page/search/sort changes — not to
  // onFetchData's identity — so the initial mount-time fetch (made while the
  // ID was still undefined) is a no-op. Once the real ID is known, manually
  // trigger the fetch that would otherwise never happen. This must not use a
  // remounting `key` on TableMain: remounting wipes the component's internal
  // manage-columns drawer state, which broke that UI for these three tables.
  useEffect(() => {
    if (moduleIds.inquiry) inquiryTableRef.current?.refresh();
  }, [moduleIds.inquiry]);

  useEffect(() => {
    if (moduleIds.retail) retailTableRef.current?.refresh();
  }, [moduleIds.retail]);

  useEffect(() => {
    if (moduleIds.psf) psfTableRef.current?.refresh();
  }, [moduleIds.psf]);

  const loadCcdPreview = useCallback(
    async (
      type: "inquiry" | "retail" | "psf",
      moduleId: number | undefined,
      search: string | undefined,
      setRows: (rows: any[]) => void,
    ) => {
      if (!moduleId) {
        if (modulesLoaded) {
          setRows([]);
          setCcdLoading((prev) => ({ ...prev, [type]: false }));
        }
        return;
      }

      setCcdLoading((prev) => ({ ...prev, [type]: true }));
      try {
        const res = await ccdApi.fetchModuleCustomers(moduleId, {
          page: 1,
          page_size: 5,
          search,
        });
        setRows(res.success && res.data ? res.data.customers : []);
      } catch (e) {
        console.error(`Failed to load ${type} preview`, e);
        setRows([]);
      } finally {
        setCcdLoading((prev) => ({ ...prev, [type]: false }));
      }
    },
    [modulesLoaded],
  );

  const fetchInquiryPreview = useCallback(
    async (params: any) => {
      ccdSearchRef.current.inquiry = params.search;
      return loadCcdPreview(
        "inquiry",
        moduleIds.inquiry,
        params.search,
        setInquiryRows,
      );
    },
    [loadCcdPreview, moduleIds.inquiry],
  );

  const fetchRetailPreview = useCallback(
    async (params: any) => {
      ccdSearchRef.current.retail = params.search;
      return loadCcdPreview(
        "retail",
        moduleIds.retail,
        params.search,
        setRetailRows,
      );
    },
    [loadCcdPreview, moduleIds.retail],
  );

  const fetchPsfPreview = useCallback(
    async (params: any) => {
      ccdSearchRef.current.psf = params.search;
      return loadCcdPreview("psf", moduleIds.psf, params.search, setPsfRows);
    },
    [loadCcdPreview, moduleIds.psf],
  );

  // ---------- Customer table ----------
  const handleCustomerPress = useCallback(
    (id: string) => open(<CustomerDetailScreen id={id} />, "Customer Details"),
    [open],
  );
  const customerColumns = getCustomerColumns(handleCustomerPress);

  const fetchCustomerData = useCallback(
    async (params: any) => {
      customerSearchRef.current = params.search;
      await loadCustomers(params.search);
    },
    [loadCustomers],
  );

  // ---------- CCD shared press handler ----------
  const handleInquiryPress = useCallback(
    (id: string) => open(<CCDInquiryDetailScreen id={id} />, "Inquiry Details"),
    [open],
  );

  const handleRetailPress = useCallback(
    (id: string) => open(<CCDRetailDetailScreen id={id} />, "Sales Details"),
    [open],
  );

  const handlePsfPress = useCallback(
    (id: string) => open(<CCDPsfDetailScreen id={id} />, "Job Card Details"),
    [open],
  );

  // Same column sets the full CCD screens use, so the dashboard previews stay
  // in sync with /ccd.
  const inquiryColumns = useMemo(
    () => getCcdInquiryColumns(handleInquiryPress),
    [handleInquiryPress],
  );

  const retailColumns = useMemo(
    () => getCcdRetailColumns(handleRetailPress),
    [handleRetailPress],
  );

  const psfColumns = useMemo(
    () => getCcdPsfColumns(handlePsfPress),
    [handlePsfPress],
  );

  const inquiryData = useMemo(
    () => transformInquiryRows(inquiryRows.slice(0, 5)),
    [inquiryRows],
  );

  const retailData = useMemo(
    () => transformRetailRows(retailRows.slice(0, 5)),
    [retailRows],
  );

  const psfData = useMemo(
    () => transformPsfRows(psfRows.slice(0, 5)),
    [psfRows],
  );

  const getTrend = (pctChange: number | null) => ({
    type:
      pctChange !== null && pctChange >= 0
        ? ("increase" as const)
        : ("decrease" as const),
    percentage: pctChange !== null ? Math.abs(pctChange) : 0,
    comparisonText: "vs last month",
  });

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      dispatch(fetchCrmSummary()),
      dispatch(fetchModules()),
      loadCustomers(customerSearchRef.current),
      loadCcdPreview(
        "inquiry",
        moduleIds.inquiry,
        ccdSearchRef.current.inquiry,
        setInquiryRows,
      ),
      loadCcdPreview(
        "retail",
        moduleIds.retail,
        ccdSearchRef.current.retail,
        setRetailRows,
      ),
      loadCcdPreview(
        "psf",
        moduleIds.psf,
        ccdSearchRef.current.psf,
        setPsfRows,
      ),
    ]);
  }, [dispatch, loadCustomers, loadCcdPreview, moduleIds]);

  const { refreshControl } = useScreenRefresh(handleRefresh);

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack
        flex={1}
        backgroundColor="$background"
        borderTopLeftRadius={24}
        borderTopRightRadius={24}
        overflow="hidden"
      >
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 90,
            gap: 16,
          }}
        >
          <StatsCard
            title="Total Leads"
            value={crmSummary?.total_leads ?? 0}
            icon={<Users size={24} color={theme?.statIconIndigo?.val} />}
            iconBg={theme?.statIconBackgroundIndigo?.val}
            trend={getTrend(crmSummary?.total_leads_pct_change ?? null)}
          />

          <SectionHeader
            title="Recent Customer"
            onViewAll={() => router.push("/customer" as any)}
          />
          <TableMain
            columns={customerColumns}
            data={customers.slice(0, 5)}
            totalItems={customers.slice(0, 5).length}
            onFetchData={fetchCustomerData}
            enableSearch
            enablePagination={false}
            enableColumnManagement
            enableSorting
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No customers found"
            isLoading={customerLoading}
            showCard
          />

          {/* Recent CCD Inquiry */}
          <SectionHeader
            title="Recent CCD Inquiry"
            onViewAll={() =>
              router.push({
                pathname: "/ccd",
                params: { tab: "inquiry" },
              } as any)
            }
          />
          <TableMain
            ref={inquiryTableRef}
            columns={inquiryColumns}
            data={inquiryData}
            totalItems={inquiryData.length}
            onFetchData={fetchInquiryPreview}
            enableSearch
            enablePagination={false}
            enableColumnManagement
            enableSorting
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No inquiries found"
            isLoading={ccdLoading.inquiry}
            showCard
          />

          {/* Recent CCD Retail */}
          <SectionHeader
            title="Recent CCD Retail"
            onViewAll={() =>
              router.push({
                pathname: "/ccd",
                params: { tab: "retail" },
              } as any)
            }
          />
          <TableMain
            ref={retailTableRef}
            columns={retailColumns}
            data={retailData}
            totalItems={retailData.length}
            onFetchData={fetchRetailPreview}
            enableSearch
            enablePagination={false}
            enableColumnManagement
            enableSorting
            keyExtractor={(item) => (item.sales_id ?? item.id).toString()}
            emptyMessage="No retail data found"
            isLoading={ccdLoading.retail}
            showCard
          />

          <SectionHeader
            title="Recent CCD PSF"
            onViewAll={() =>
              router.push({ pathname: "/ccd", params: { tab: "psf" } } as any)
            }
          />
          <TableMain
            ref={psfTableRef}
            columns={psfColumns}
            data={psfData}
            totalItems={psfData.length}
            onFetchData={fetchPsfPreview}
            enableSearch
            enablePagination={false}
            enableColumnManagement
            enableSorting
            keyExtractor={(item) => (item.jobcard_id ?? item.id).toString()}
            emptyMessage="No PSF data found"
            isLoading={ccdLoading.psf}
            showCard
          />
        </ScrollView>
      </YStack>
    </YStack>
  );
}
