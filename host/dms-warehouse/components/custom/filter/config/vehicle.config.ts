import { store } from "@/app/features/store";
import {
  fetchMasterColors,
  fetchMasterVariants,
  fetchMasterVehicles,
} from "../../../../app/features/master/store/master.thunks";
import { FilterConfigBuilder } from "../filterConfigBuilder";

const loadVehicleOptions = async (page: number) => {
  await store.dispatch(fetchMasterVehicles({ page }));
  const state = store.getState().warehouseMaster;

  return {
    options: state.vehicles.map((v) => ({
      label: v.name,
      value: v.id.toString(),
      key: `vehicle_${v.id}`,
    })),
    hasMore: state.vehiclesHasMore,
  };
};

const loadVariantOptions = async (page: number) => {
  await store.dispatch(fetchMasterVariants({ page }));
  const state = store.getState().warehouseMaster;

  return {
    options: state.variants.map((v) => ({
      label: v.name,
      value: v.id.toString(),
      key: `variant_${v.id}`,
    })),
    hasMore: state.variantsHasMore,
  };
};

const loadColorOptions = async (page: number) => {
  await store.dispatch(fetchMasterColors({ page }));
  const state = store.getState().warehouseMaster;

  return {
    options: state.colors.map((c) => ({
      label: c.name,
      value: c.id.toString(),
      key: `color_${c.id}`,
    })),
    hasMore: state.colorsHasMore,
  };
};

export const getVehicleStockFilterConfig = () => {
  return new FilterConfigBuilder("Filters", 55)
    .addCustomFilter({
      id: "vehicle",
      label: "Vehicle",
      type: "search-select",
      operator: "equals",
      defaultValue: "",
      placeholder: "Select vehicle",
      paginatedOptionsLoader: loadVehicleOptions,
    })
    .addCustomFilter({
      id: "variant",
      label: "Variant",
      type: "search-select",
      operator: "equals",
      defaultValue: "",
      placeholder: "Select variant",
      paginatedOptionsLoader: loadVariantOptions,
    })
    .addCustomFilter({
      id: "color",
      label: "Color",
      type: "search-select",
      operator: "equals",
      defaultValue: "",
      placeholder: "Select color",
      paginatedOptionsLoader: loadColorOptions,
    })
    .build();
};
