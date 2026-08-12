import { useEffect, useState } from "react";
import { shallowEqual } from "react-redux";
import { Pressable, View } from "react-native";
import { Text, XStack, YStack, useTheme } from "tamagui";
import { ChevronDown } from "lucide-react-native";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../app/features/hooks";
import { fetchMasterStockyards } from "../../../app/features/master/store/master.thunks";
import { MasterStockyard } from "../../../app/features/master/types";
import { Button } from "../../../components/custom/buttons/button";
import { BottomDrawer } from "../../../components/custom/drawer";
import { RequiredLabel } from "../../../components/custom/requiredLabel";
import { SearchSelectSheet } from "../../../components/custom/filter/SearchSelectSheet";

interface StockyardSelectionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStockyardSelect: (stockyardId: number, stockyardName: string) => void;
}

export function StockyardSelectionDrawer({
  open,
  onOpenChange,
  onStockyardSelect,
}: StockyardSelectionDrawerProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [selectedStockyardId, setSelectedStockyardId] = useState<
    number | null
  >(null);
  const [selectedStockyardName, setSelectedStockyardName] =
    useState<string>("");
  const [isStockyardSearchOpen, setIsStockyardSearchOpen] = useState(false);

  const { stockyards, stockyardsLoading } = useAppSelector(
    (state) => ({
      stockyards: (state.warehouseMaster as any)?.stockyards ?? [],
      stockyardsLoading:
        (state.warehouseMaster as any)?.stockyardsLoading ?? false,
    }),
    shallowEqual,
  );

  // Load stockyards when drawer opens
  useEffect(() => {
    if (open && stockyards.length === 0 && !stockyardsLoading) {
      dispatch(fetchMasterStockyards());
    }
  }, [open, stockyards.length, stockyardsLoading, dispatch]);

  const stockyardOptions = stockyards.map((yard: MasterStockyard) => ({
    label: yard.name,
    value: yard.id.toString(),
  }));

  const handleContinue = () => {
    if (selectedStockyardId) {
      onStockyardSelect(selectedStockyardId, selectedStockyardName);
      setSelectedStockyardId(null);
      setSelectedStockyardName("");
      onOpenChange(false);
    }
  };

  return (
    <BottomDrawer
      open={open}
      onOpenChange={onOpenChange}
      headerTitle="Select Stockyard"
      height={35}
      stickyBottomContent={
        <XStack gap="$3">
          <Button
            flex={1}
            buttonVariant="ghost"
            buttonText="Cancel"
            onPress={() => onOpenChange(false)}
          />
          <Button
            flex={1}
            buttonVariant="primary"
            buttonText="Continue"
            onPress={handleContinue}
            disabled={!selectedStockyardId || stockyardsLoading}
          />
        </XStack>
      }
    >
      <YStack gap="$4">
        <YStack gap="$2">
          <RequiredLabel>Stockyard</RequiredLabel>
          <Pressable
            onPress={() => !stockyardsLoading && setIsStockyardSearchOpen(true)}
            disabled={stockyardsLoading}
          >
            {({ pressed }) => (
              <View
                style={{
                  height: 50,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.inputBorderColor?.val ?? "#e5e7eb",
                  backgroundColor: theme.inputBackground?.val ?? "#f9fafb",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: pressed ? 0.85 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: selectedStockyardId
                      ? (theme.descriptionText?.val ?? "#111")
                      : (theme.placeholder?.val ?? "#9ca3af"),
                    flex: 1,
                    opacity: selectedStockyardId ? 1 : 0.65,
                  }}
                  numberOfLines={1}
                >
                  {selectedStockyardName || "Select Stockyard"}
                </Text>
                <ChevronDown
                  size={18}
                  color={theme.descriptionText?.val ?? "#111"}
                />
              </View>
            )}
          </Pressable>
        </YStack>
      </YStack>

      <SearchSelectSheet
        open={isStockyardSearchOpen}
        onClose={() => setIsStockyardSearchOpen(false)}
        options={stockyardOptions}
        value={selectedStockyardId?.toString() || ""}
        onChange={(value: string) => {
          const yard = stockyards.find(
            (s: MasterStockyard) => s.id === parseInt(value),
          );
          setSelectedStockyardId(parseInt(value));
          setSelectedStockyardName(yard?.name || "");
          setIsStockyardSearchOpen(false);
        }}
        title="Search Stockyard"
        isLoading={stockyardsLoading}
      />
    </BottomDrawer>
  );
}
