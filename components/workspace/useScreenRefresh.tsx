import { useAppSelector } from "@/app/features/hooks";
import { useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { useTheme } from "tamagui";

/**
 * Shared pull-to-refresh wiring for tab main screens.
 *
 * Screens own their own data, so the caller just supplies what to refetch and
 * gets back a themed <RefreshControl> to hand to any ScrollView / FlatList.
 * The pull is gated on auth: a refresh on a screen the session has already
 * dropped out from under would only fire 401s and trip the global
 * auth-failure redirect.
 */
export function useScreenRefresh(
  onRefresh?: () => Promise<unknown> | unknown,
) {
  const theme = useTheme();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!isAuthenticated || !onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error("[Refresh] Failed to sync data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, onRefresh]);

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={[theme.primary?.val]}
      tintColor={theme.primary?.val}
    />
  ) : undefined;

  return { refreshing, refreshControl, handleRefresh };
}
