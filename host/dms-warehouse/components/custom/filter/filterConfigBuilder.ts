// src/components/custom/filter/filterConfigBuilder.ts
import { FilterConfig, FilterField, FilterOperator } from "./filter";

export class FilterConfigBuilder {
  private config: Partial<FilterConfig> = {};

  constructor(title: string, drawerHeight: number = 40) {
    this.config.title = title;
    this.config.fields = [];
    this.config.drawerHeight = drawerHeight;
  }

  addTextFilter(
    id: string,
    label: string,
    options?: {
      placeholder?: string;
      operator?: FilterOperator;
      apiField?: string;
      defaultValue?: string;
    },
  ): this {
    this.config.fields!.push({
      id,
      label,
      type: "text",
      operator: options?.operator || "contains",
      placeholder: options?.placeholder || `Enter ${label.toLowerCase()}`,
      apiField: options?.apiField,
      defaultValue: options?.defaultValue || "",
    });
    return this;
  }

  addNumberFilter(
    id: string,
    label: string,
    options?: {
      placeholder?: string;
      operator?: FilterOperator;
      apiField?: string;
      defaultValue?: number;
    },
  ): this {
    this.config.fields!.push({
      id,
      label,
      type: "number",
      operator: options?.operator || "equals",
      placeholder: options?.placeholder || `Enter ${label.toLowerCase()}`,
      apiField: options?.apiField,
      defaultValue: options?.defaultValue,
    });
    return this;
  }

  // UPDATED: Support both static options and loader
  addSelectFilter(
    id: string,
    label: string,
    optionsOrLoader:
      | { label: string; value: any }[]
      | (() => Promise<{ label: string; value: any }[]>),
    optionsConfig?: {
      operator?: FilterOperator;
      apiField?: string;
      defaultValue?: any;
      placeholder?: string;
    },
  ): this {
    const field: FilterField = {
      id,
      label,
      type: "select",
      operator: optionsConfig?.operator || "equals",
      apiField: optionsConfig?.apiField,
      defaultValue: optionsConfig?.defaultValue,
      placeholder:
        optionsConfig?.placeholder || `Select ${label.toLowerCase()}`,
    };

    // Handle both static options and dynamic loader
    if (Array.isArray(optionsOrLoader)) {
      field.options = optionsOrLoader;
    } else {
      field.optionsLoader = optionsOrLoader;
    }

    this.config.fields!.push(field);
    return this;
  }

  addMultiSelectFilter(
    id: string,
    label: string,
    options: { label: string; value: any }[],
    optionsConfig?: {
      operator?: FilterOperator;
      apiField?: string;
      defaultValue?: any[];
    },
  ): this {
    this.config.fields!.push({
      id,
      label,
      type: "multi-select",
      options,
      operator: optionsConfig?.operator || "in",
      apiField: optionsConfig?.apiField,
      defaultValue: optionsConfig?.defaultValue || [],
    });
    return this;
  }

  addDateRangeFilter(
    id: string,
    label: string,
    options?: {
      operator?: FilterOperator;
      apiField?: string;
      defaultValue?: { from?: string; to?: string };
    },
  ): this {
    this.config.fields!.push({
      id,
      label,
      type: "date-range",
      operator: options?.operator || "between",
      apiField: options?.apiField,
      defaultValue: options?.defaultValue || {},
    });
    return this;
  }

  addRadioFilter(
    id: string,
    label: string,
    options: { label: string; value: any }[],
    optionsConfig?: {
      operator?: FilterOperator;
      apiField?: string;
      defaultValue?: any;
    },
  ): this {
    this.config.fields!.push({
      id,
      label,
      type: "radio",
      options,
      operator: optionsConfig?.operator || "equals",
      apiField: optionsConfig?.apiField,
      defaultValue: optionsConfig?.defaultValue,
    });
    return this;
  }

  addCustomFilter(field: FilterField): this {
    this.config.fields!.push(field);
    return this;
  }

  build(): FilterConfig {
    if (!this.config.title || !this.config.fields) {
      throw new Error("Filter config must have title and fields");
    }
    return this.config as FilterConfig;
  }
}
