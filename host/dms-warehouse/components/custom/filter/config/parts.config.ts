import { store } from "@/app/features/store";
import {
  fetchMasterLocations,
  fetchMasterStockyards,
} from "../../../../app/features/master/store/master.thunks";
import { FilterConfigBuilder } from "../filterConfigBuilder";

const loadStockyardOptions = async (page: number) => {
  await store.dispatch(fetchMasterStockyards({ page }));
  const state = store.getState().warehouseMaster;

  return {
    options: state.stockyards.map((s) => ({
      label: s.name,
      value: s.id.toString(),
      key: `stockyard_${s.id}`,
    })),
    hasMore: state.stockyardsHasMore,
  };
};

// Location loader - send ID
const loadLocationOptions = async (page: number) => {
  await store.dispatch(fetchMasterLocations({ page }));
  const state = store.getState().warehouseMaster;

  return {
    options: state.locations.map((l) => ({
      label: l.location_name || l.location_code,
      value: l.id.toString(),
      key: `location_${l.id}`,
    })),
    hasMore: state.locationsHasMore,
  };
};

export const getPartsFilterConfig = () => {
  return new FilterConfigBuilder("Filter Parts", 35)

    .addCustomFilter({
      id: "stockyard__id",
      label: "Stockyard",
      type: "search-select",
      operator: "equals",
      apiField: "stockyard__id",
      defaultValue: "",
      placeholder: "Select stockyard",
      paginatedOptionsLoader: loadStockyardOptions,
    })
    .build();
};
