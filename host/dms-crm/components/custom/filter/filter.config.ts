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
