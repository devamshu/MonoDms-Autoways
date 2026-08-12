// src/components/custom/filter/filterContext.tsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { FilterConfig } from "./filter";

interface FilterContextType {
  activeFilters: Record<string, any>;
  activeFilterCount: number;
  isFilterVisible: boolean;
  currentFilterConfig: FilterConfig | null;
  openFilters: (config: FilterConfig) => void;
  closeFilters: () => void;
  applyFilters: (filters: Record<string, any>) => void;
  resetFilters: () => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [currentFilterConfig, setCurrentFilterConfig] =
    useState<FilterConfig | null>(null);

  const calculateFilterCount = useCallback(
    (filters: Record<string, any>, config?: FilterConfig): number => {
      return Object.entries(filters).filter(([key, value]) => {
        if (!value) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "object" && Object.keys(value).length === 0)
          return false;

        if (config) {
          const field = config.fields.find((f) => f.id === key);
          if (field?.defaultValue !== undefined) {
            return JSON.stringify(value) !== JSON.stringify(field.defaultValue);
          }
        }
        return true;
      }).length;
    },
    [],
  );

  const openFilters = useCallback(
    (config: FilterConfig) => {
      setCurrentFilterConfig(config);
      // Don't reset activeFilters - keep current values
      const count = calculateFilterCount(activeFilters, config);
      setActiveFilterCount(count);
      setIsFilterVisible(true);
    },
    [activeFilters, calculateFilterCount],
  );

  const closeFilters = useCallback(() => {
    setIsFilterVisible(false);
    setCurrentFilterConfig(null);
  }, []);

  const applyFilters = useCallback(
    (filters: Record<string, any>) => {
      if (!currentFilterConfig) return;

      setActiveFilters(filters);
      const count = calculateFilterCount(filters, currentFilterConfig);
      setActiveFilterCount(count);
      setIsFilterVisible(false);
    },
    [currentFilterConfig, calculateFilterCount],
  );

  const resetFilters = useCallback(() => {
    if (!currentFilterConfig) return;

    const defaults: Record<string, any> = {};
    currentFilterConfig.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      }
    });

    setActiveFilters(defaults);
    setActiveFilterCount(0);
    setIsFilterVisible(false);
  }, [currentFilterConfig]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setActiveFilterCount(0);
  }, []);

  const contextValue = useMemo(
    () => ({
      activeFilters,
      activeFilterCount,
      isFilterVisible,
      currentFilterConfig,
      openFilters,
      closeFilters,
      applyFilters,
      resetFilters,
      clearAllFilters,
    }),
    [activeFilters, activeFilterCount, isFilterVisible, currentFilterConfig, openFilters, closeFilters, applyFilters, resetFilters, clearAllFilters]
  );

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider");
  }
  return context;
};
