import { FetchParams } from "./types";

// Records with no explicit sort should still show newest-first, matching
// the default state after a fresh page load or a filter reset.
export const DEFAULT_TABLE_ORDERING = "-created_at";

export function buildTableApiParams(
  params: FetchParams,
  extraParams?: Record<string, any>,
): Record<string, any> {
  const ordering = params.sortBy
    ? params.sortOrder === "desc"
      ? `-${params.sortBy}`
      : params.sortBy
    : DEFAULT_TABLE_ORDERING;

  return {
    page: params.page,
    page_size: params.limit,
    search: params.search,
    ordering,
    ...extraParams,
  };
}
