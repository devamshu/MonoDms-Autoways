import type { Href } from "expo-router";
import * as SecureStore from "expo-secure-store";

export type AppSelection = "dms-crm" | "dms-warehouse" | "dms-management";

export const AVAILABLE_APPS: Array<{
  id: AppSelection;
  title: string;
  description: string;
  route: Href;
}> = [
  {
    id: "dms-crm",
    title: "DMS CRM",
    description: "Sales, customers, follow-ups, and account management.",
    route: "/(crm)",
  },
  {
    id: "dms-warehouse",
    title: "DMS Warehouse",
    description: "Stock, inventory, receiving, and fulfillment flows.",
    route: "/(warehouse)",
  },
  {
    id: "dms-management",
    title: "DMS Management",
    description: "Admin oversight, reporting, and operational controls.",
    route: "/(management)",
  },
];

const SELECTED_APP_KEY = "selected_app";

export async function saveSelectedApp(app: AppSelection) {
  await SecureStore.setItemAsync(SELECTED_APP_KEY, app);
}

export async function loadSelectedApp() {
  return SecureStore.getItemAsync(SELECTED_APP_KEY) as Promise<AppSelection | null>;
}

// Lets a signed-in user pick a different app without logging out: only the
// selection is forgotten, so tokens and everything else stay intact.
export async function clearSelectedApp() {
  await SecureStore.deleteItemAsync(SELECTED_APP_KEY);
}