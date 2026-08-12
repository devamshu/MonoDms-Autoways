// components/custom/filter/filterContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useState } from "react";
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

// Helper to get storage key for a config
const getStorageKey = (config: FilterConfig): string => {
  return `filters_${config.title.toLowerCase().replace(/\s/g, "_")}`;
};

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [currentFilterConfig, setCurrentFilterConfig] =
    useState<FilterConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved filters for a specific config
  const loadSavedFilters = useCallback(
    async (config: FilterConfig): Promise<Record<string, any>> => {
      try {
        const key = getStorageKey(config);
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed;
        }

        // Return default values from config
        const defaults: Record<string, any> = {};
        config.fields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            defaults[field.id] = field.defaultValue;
          }
        });
        return defaults;
      } catch (error) {
        console.error("Failed to load saved filters:", error);
        return {};
      }
    },
    [],
  );

  // Save filters for current config
  const saveFilters = useCallback(
    async (config: FilterConfig, filters: Record<string, any>) => {
      try {
        const key = getStorageKey(config);
        await AsyncStorage.setItem(key, JSON.stringify(filters));
      } catch (error) {
        console.error("Failed to save filters:", error);
      }
    },
    [],
  );

  // Calculate active filter count
  const calculateFilterCount = useCallback(
    (filters: Record<string, any>, config?: FilterConfig): number => {
      return Object.entries(filters).filter(([key, value]) => {
        if (!value) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "object" && Object.keys(value).length === 0)
          return false;

        // Check if it's default value
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

  // Open filters with specific config
  const openFilters = useCallback(
    async (config: FilterConfig) => {
      setIsLoading(true);
      setCurrentFilterConfig(config);

      // Load saved filters for this config
      const savedFilters = await loadSavedFilters(config);
      setActiveFilters(savedFilters);
      const count = calculateFilterCount(savedFilters, config);
      setActiveFilterCount(count);

      setIsFilterVisible(true);
      setIsLoading(false);
    },
    [loadSavedFilters, calculateFilterCount],
  );

  const closeFilters = useCallback(() => {
    setIsFilterVisible(false);
    setCurrentFilterConfig(null);
  }, []);

  const applyFilters = useCallback(
    async (filters: Record<string, any>) => {
      if (!currentFilterConfig) return;

      setActiveFilters(filters);
      const count = calculateFilterCount(filters, currentFilterConfig);
      setActiveFilterCount(count);

      // Save filters to storage
      await saveFilters(currentFilterConfig, filters);

      setIsFilterVisible(false);
    },
    [currentFilterConfig, calculateFilterCount, saveFilters],
  );

  const resetFilters = useCallback(async () => {
    if (!currentFilterConfig) return;

    // Get default values from config
    const defaults: Record<string, any> = {};
    currentFilterConfig.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue;
      }
    });

    setActiveFilters(defaults);
    setActiveFilterCount(0);

    // Save defaults to storage
    await saveFilters(currentFilterConfig, defaults);

    setIsFilterVisible(false);
  }, [currentFilterConfig, saveFilters]);

  const clearAllFilters = useCallback(async () => {
    if (!currentFilterConfig) return;

    setActiveFilters({});
    setActiveFilterCount(0);
    await saveFilters(currentFilterConfig, {});
  }, [currentFilterConfig, saveFilters]);

  return (
    <FilterContext.Provider
      value={{
        activeFilters,
        activeFilterCount,
        isFilterVisible,
        currentFilterConfig,
        openFilters,
        closeFilters,
        applyFilters,
        resetFilters,
        clearAllFilters,
      }}
    >
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
