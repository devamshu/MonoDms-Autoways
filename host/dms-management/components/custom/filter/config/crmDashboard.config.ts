import { masterApi } from "../../../../app/features/master/api/master.api";
import { FilterConfigBuilder } from "../filterConfigBuilder";

const loadFiscalYearOptions = async () => {
  const res = await masterApi.fetchFiscalYears();
  if (!res.success || !res.data) return [];
  return res.data.map((fy) => ({
    label: fy.text,
    value: fy.id.toString(),
    key: `fiscal_year_${fy.id}`,
  }));
};

const loadDealerOptions = async () => {
  const res = await masterApi.fetchDealers();
  if (!res.success || !res.data) return [];
  return res.data.map((d) => ({
    label: d.name ?? `Dealer #${d.id}`,
    value: d.id.toString(),
    key: `dealer_${d.id}`,
  }));
};

const loadBrandOptions = async () => {
  const res = await masterApi.fetchBrands();
  if (!res.success || !res.data) return [];
  return res.data.map((b) => ({
    label: b.name,
    value: b.id.toString(),
    key: `brand_${b.id}`,
  }));
};

// Temporarily disabled: vehicle filter is hidden on the CRM dashboard for now.
// const loadVehicleOptions = async () => {
//   const res = await masterApi.fetchVehicles();
//   if (!res.success || !res.data) return [];
//   return res.data.map((v) => ({
//     label: v.name,
//     value: v.id.toString(),
//     key: `vehicle_${v.id}`,
//   }));
// };

export const getCrmDashboardFilterConfig = () => {
  return (
    new FilterConfigBuilder("Filter Dashboard", 60)
      .addSearchSelectFilter(
        "fiscal_year",
        "Fiscal Year",
        loadFiscalYearOptions,
        {
          defaultValue: "",
          apiField: "fiscal_year",
        },
      )
      .addSearchSelectFilter("dealer", "Dealer", loadDealerOptions, {
        defaultValue: "",
        apiField: "dealer",
      })
      .addSearchSelectFilter("brand", "Brand", loadBrandOptions, {
        defaultValue: "",
        apiField: "brand",
      })
      // Temporarily disabled: vehicle filter is hidden on the CRM dashboard for now.
      // .addSelectFilter("vehicle", "Vehicle", loadVehicleOptions, {
      //   defaultValue: "",
      //   apiField: "vehicle",
      // })
      .build()
  );
};
