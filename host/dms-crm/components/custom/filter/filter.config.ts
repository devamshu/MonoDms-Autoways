import { masterApi } from "../../../app/features/master/api/master.api";
import { apiClient } from "../../../../../app/services/axios";
import { FilterConfigBuilder } from "./filterConfigBuilder";

export const usersFilterConfig = new FilterConfigBuilder("Filter Users")
  .addSelectFilter(
    "role",
    "Role",
    [
      { label: "Admin", value: "Admin" },
      { label: "Manager", value: "Manager" },
      { label: "User", value: "User" },
      { label: "Support", value: "Support" },
    ],
    { defaultValue: "" },
  )

  .build();

// Mirrors the web Customer page's All/Booked/Sold status Select. The id is
// UI-only and never sent to the API — customers.tsx translates it to is_sold.
export const customersFilterConfig = new FilterConfigBuilder("Filter Customers")
  .addSelectFilter(
    "customer_status",
    "Status",
    [
      { label: "All", value: "all" },
      { label: "Booked", value: "booked" },
      { label: "Sold", value: "sold" },
    ],
    { defaultValue: "all" },
  )

  .build();

// Mirrors the web Inquiry FilterDrawer
// (src/pages/CRM/Inquiry/FilterDrawer.tsx). Field ids match the /crm/inquiry/
// query params exactly, so applied values are spread straight into the list
// fetch. is_booked is fixed by the screen, not offered here.
const masterOptions = (rows?: { id: number; name: string }[]) =>
  (rows ?? []).map((row) => ({ label: row.name, value: String(row.id) }));

interface EmployeeRow {
  id: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  name?: string;
}

export const inquiryFilterConfig = new FilterConfigBuilder("Filter Inquiry")
  .addCustomFilter({
    id: "kind",
    label: "Inquiry Kind",
    type: "select",
    placeholder: "Any",
    optionsLoader: async () =>
      masterOptions((await masterApi.fetchInquiryKinds()).data),
  })
  // Web shows Branch to admins only; mobile keeps it ungated (server scopes the
  // list anyway), matching the drawer's fail-open permission handling.
  .addCustomFilter({
    id: "dealer_id",
    label: "Branch",
    type: "select",
    placeholder: "Any",
    optionsLoader: async () =>
      masterOptions((await masterApi.fetchDealers()).data),
  })
  .addCustomFilter({
    id: "inquiry_source_id",
    label: "Inquiry Source",
    type: "select",
    placeholder: "Any",
    optionsLoader: async () =>
      masterOptions((await masterApi.fetchSourceTypes()).data),
  })
  .addCustomFilter({
    id: "brand_id",
    label: "Brand",
    type: "select",
    placeholder: "Any",
    optionsLoader: async () =>
      masterOptions((await masterApi.fetchBrands()).data),
  })
  .addCustomFilter({
    id: "assigned_to_id",
    label: "Sales Executive",
    type: "search-select",
    placeholder: "Any",
    // One page, searched client-side in the picker (the modal's paged loader
    // swaps pages instead of appending them).
    optionsLoader: async () => {
      const response = await apiClient.get<{ results: EmployeeRow[] }>(
        "/master-employee/",
        { params: { page: 1, page_size: 200 } },
      );
      const rows =
        response.success && response.data ? response.data.results : [];
      return rows.map((e) => ({
        label:
          [e.first_name, e.middle_name, e.last_name]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          e.name ||
          `Employee ${e.id}`,
        value: String(e.id),
      }));
    },
  })
  .addCustomFilter({
    id: "is_converted_to_deal",
    label: "Converted to Deal",
    type: "select",
    placeholder: "Any",
    options: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
  })
  .addCustomFilter({
    id: "is_reviewed",
    label: "Review Status",
    type: "select",
    placeholder: "Any",
    options: [
      { label: "Reviewed", value: "true" },
      { label: "Not Reviewed", value: "false" },
    ],
  })
  .addCustomFilter({
    id: "date_from",
    label: "Date From",
    type: "text",
    placeholder: "YYYY-MM-DD",
  })
  .addCustomFilter({
    id: "date_to",
    label: "Date To",
    type: "text",
    placeholder: "YYYY-MM-DD",
  })

  .build();

// Mirrors the web Followup FilterDrawer (src/pages/CRM/Followup/
// FollowupFilterDrawer.tsx). Field ids are the /crm/followup/ query params.
// The Executive filter is admin-only on web (non-admins are already scoped to
// their own followups server-side), so the config is built per viewer.
const FOLLOWUP_CONTACT_TYPES = [
  "Call",
  "Viber/WhatsApp",
  "Showroom visit",
  "Home visit",
  "SMS",
  "Email",
  "Meeting",
];

export const getFollowupFilterConfig = (isAdmin: boolean) => {
  const builder = new FilterConfigBuilder("Filter Followups")
    .addCustomFilter({
      id: "inquiry__kind__id",
      label: "Inquiry Kind",
      type: "select",
      placeholder: "Any",
      optionsLoader: async () =>
        masterOptions((await masterApi.fetchInquiryKinds()).data),
    })
    .addCustomFilter({
      id: "contact_type",
      label: "Contact Type",
      type: "select",
      placeholder: "Any",
      options: FOLLOWUP_CONTACT_TYPES.map((t) => ({ label: t, value: t })),
    })
    .addCustomFilter({
      id: "overdue",
      label: "Overdue only",
      type: "select",
      placeholder: "Any",
      options: [
        { label: "Overdue pending follow-ups only", value: "true" },
      ],
    })
    .addCustomFilter({
      id: "inquiry__id",
      label: "Customer",
      type: "search-select",
      placeholder: "Search by customer name or inquiry number",
      // One page, searched client-side in the picker.
      optionsLoader: async () => {
        const response = await apiClient.get<{ results: any[] }>(
          "/crm/inquiry/",
          { params: { page: 1, page_size: 100 } },
        );
        const rows =
          response.success && response.data ? response.data.results : [];
        return rows.map((i) => ({
          label: i.inq_no ? `${i.inq_no} — ${i.name}` : i.name,
          value: String(i.id),
        }));
      },
    });

  if (isAdmin) {
    builder.addCustomFilter({
      id: "executive__id",
      label: "Executive",
      type: "search-select",
      placeholder: "Any",
      optionsLoader: async () => {
        const response = await apiClient.get<{ results: EmployeeRow[] }>(
          "/master-employee/",
          { params: { page: 1, page_size: 200 } },
        );
        const rows =
          response.success && response.data ? response.data.results : [];
        return rows.map((e) => ({
          label:
            [e.first_name, e.middle_name, e.last_name]
              .filter(Boolean)
              .join(" ")
              .trim() ||
            e.name ||
            `Employee ${e.id}`,
          value: String(e.id),
        }));
      },
    });
  }

  return builder.build();
};

// Structure for undersatnding whtas the process

//   components/custom/filter/
// ├── filter.ts                    # ✅ Types (FilterField, FilterConfig, etc.)
// ├── filterConfigBuilder.ts       # ✅ Builder pattern for creating filters
// ├── filter.config.ts             # ✅ All page configurations (users, dealers, orders, parts)
// ├── filterContext.tsx            # ✅ Global filter state with persistence
// ├── GenericFilterModal.tsx       # ✅ Reusable modal component
// └── useTableFilters.ts           # ✅ Optional hook for table integration

// app/_layout.tsx                  # ✅ Wrapped with FilterProvider
// app/users/index.tsx              # ✅ Uses useFilters() hook
// app/dealer/index.tsx             # ✅ Uses useFilters() hook
