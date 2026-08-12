// host/dms-management/utils/dashboard.utils.ts

import { useTheme } from "tamagui";
import { MonthlyConversionRow } from "../../../dms-crm/app/features/dashboard/types";

/** Shared donut palette. Slices cycle through this in order. */
export const DONUT_COLOR_TOKENS = [
  "primary",
  "statIconEmerald",
  "statIconAmber",
  "ongoing",
  "error",
  "pending",
  "statIconViolet",
  "statIconTeal",
  "statIconPink",
] as const;

/** Shared bar palette. Bars cycle through this in order. */
export const BAR_COLOR_TOKENS = [
  "primary",
  "ongoing",
  "statIconAmber",
  "statIconEmerald",
  "error",
  "pending",
] as const;

/**
 * Resolves palette tokens to concrete colors for the active theme.
 * The charts render through react-native-gifted-charts (raw SVG), which needs
 * resolved values — a "$primary" string would not render.
 */
export function useChartColors(
  tokens: readonly string[] = DONUT_COLOR_TOKENS,
): string[] {
  const theme = useTheme();
  return tokens.map((token) => theme[token]?.val as string);
}

export function getTrend(pctChange: number | null) {
  return {
    type:
      pctChange !== null && pctChange >= 0
        ? ("increase" as const)
        : ("decrease" as const),
    percentage: pctChange !== null ? Math.abs(pctChange) : 0,
    comparisonText: "vs last month",
  };
}

export function toDonutData<T extends Record<string, any>>(
  items: T[] | undefined,
  labelKey: keyof T,
  countKey: keyof T,
  colors: string[],
) {
  return (items ?? [])
    .filter((item) => item[countKey] > 0)
    .map((item, i) => ({
      label: item[labelKey],
      value: item[countKey],
      color: colors[i % colors.length],
    }));
}

export function buildMonthlyRows(
  monthlyConversion:
    | {
        months: string[];
        leads: number[];
        deals: number[];
        conversion_rate: number[];
      }
    | null
    | undefined,
): MonthlyConversionRow[] {
  if (!monthlyConversion) return [];
  return monthlyConversion.months.map((month, i) => ({
    id: month,
    month,
    leads: monthlyConversion.leads[i] ?? 0,
    deals: monthlyConversion.deals[i] ?? 0,
    conversion_rate: monthlyConversion.conversion_rate[i] ?? 0,
  }));
}
