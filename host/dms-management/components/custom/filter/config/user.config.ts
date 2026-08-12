import { masterApi } from "../../../../app/features/master/api/master.api";
import { FilterConfigBuilder } from "../filterConfigBuilder";

const loadDealerOptions = async () => {
  const res = await masterApi.fetchDealers();
  if (!res.success || !res.data) return [];
  return res.data.map((d) => ({
    label: d.name ?? `Dealer #${d.id}`,
    value: d.id.toString(),
    key: `dealer_${d.id}`,
  }));
};

export const getUserFilterConfig = () => {
  return new FilterConfigBuilder("Filter Users", 60)
    .addSelectFilter("is_dealer_user", "Dealer", loadDealerOptions, {
      defaultValue: "",
      apiField: "is_dealer_user",
    })
    .build();
};
