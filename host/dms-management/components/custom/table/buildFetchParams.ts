import { FetchParams } from "./types";

// Translates TableMain's sort intent into the DRF `ordering` query param.
// The no-sort fallback is a parameter rather than a constant: each endpoint has
// its own default ordering field, and an unsupported one is worse than none.
export function buildTableApiParams(
  params: FetchParams,
  extraParams?: Record<string, any>,
  defaultOrdering?: string,
): Record<string, any> {
  const ordering = params.sortBy
    ? params.sortOrder === "desc"
      ? `-${params.sortBy}`
      : params.sortBy
    : defaultOrdering;

  return {
    page: params.page,
    page_size: params.limit,
    search: params.search,
    ordering,
    ...extraParams,
  };
}
