import { store } from "@/app/features/store";
import { fetchMasterDealers } from "../../../../app/features/master/store/master.thunks";
import { FilterConfigBuilder } from "../filterConfigBuilder";

const STATUS_OPTIONS = [
  { label: "Stock", value: "STOCK" },
  { label: "On Test Drive", value: "ON_TEST_DRIVE" },
  { label: "Billed", value: "BILLED" },
  { label: "Booked", value: "BOOKED" },
  { label: "Canceled", value: "CANCELED" },
];

const loadDealerOptions = async (page: number) => {
  await store.dispatch(fetchMasterDealers({ page }));
  const state = store.getState().warehouseMaster;

  return {
    options: state.dealers.map((d) => ({
      label: d.name,
      value: d.id.toString(),
      key: `dealer_${d.id}`,
    })),
    hasMore: state.dealersHasMore,
  };
};

export const getDealerVehicleFilterConfig = () => {
  return new FilterConfigBuilder("Filters", 40)
    .addSelectFilter("status", "Status", STATUS_OPTIONS, {
      operator: "equals",
      placeholder: "Select status",
      defaultValue: "",
    })
    .addCustomFilter({
      id: "dealer_id",
      label: "Dealer",
      type: "search-select",
      operator: "equals",
      defaultValue: "",
      placeholder: "Select dealer",
      paginatedOptionsLoader: loadDealerOptions,
    })
    .build();
};
