import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../../../app/services/axios";
import { DropdownOption } from "../components/custom/dropdown";

interface Employee {
  id: number;
  name?: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
}

interface PaginatedEmployeeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Employee[];
}

const PAGE_SIZE = 100;

export function useEmployees(enabled: boolean) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const fetchingRef = useRef(false);
  const seenIdsRef = useRef(new Set<number>());

  const fetchPage = useCallback(
    async (page: number) => {
      if (fetchingRef.current || !hasMoreRef.current) return;
      fetchingRef.current = true;

      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const response = await apiClient.get<PaginatedEmployeeResponse>(
          "/master-employee/",
          { params: { page, page_size: PAGE_SIZE } },
        );

        if (response.success && response.data) {
          const newItems = response.data.results
            .filter((e) => !seenIdsRef.current.has(e.id))
            .map((e) => {
              seenIdsRef.current.add(e.id);
              const label =
                [e.first_name, e.middle_name, e.last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim() || e.name || `Employee ${e.id}`;
              return { label, value: e.id.toString() };
            });

          setOptions((prev) => [...prev, ...newItems]);
          hasMoreRef.current = response.data.next !== null;
          pageRef.current = page;
        } else {
          hasMoreRef.current = false;
        }
      } catch {
        hasMoreRef.current = false;
      } finally {
        fetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;
    pageRef.current = 1;
    hasMoreRef.current = true;
    seenIdsRef.current.clear();
    setOptions([]);
    fetchPage(1);
  }, [enabled, fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMoreRef.current || fetchingRef.current) return;
    fetchPage(pageRef.current + 1);
  }, [fetchPage]);

  return { options, loading, loadingMore, loadMore };
}
