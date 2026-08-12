import { memo, useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Text, XStack, useTheme } from "tamagui";
import { BottomDrawer } from "../drawer";

interface Option {
  label: string;
  value: string;
}

interface SearchSelectSheetProps {
  open: boolean;
  onClose: () => void;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  title?: string;
  isLoading?: boolean;
  onEndReached?: () => void;
}

const SearchSelectSheetComponent = ({
  open,
  onClose,
  options,
  value,
  onChange,
  title = "Select",
  isLoading,
  onEndReached,
}: SearchSelectSheetProps) => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");

  const filtered = useMemo(() => {
    if (!searchText) return options;
    const lower = searchText.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, searchText]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      onChange(selectedValue);
      onClose();
      setSearchText("");
    },
    [onChange, onClose],
  );

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const primaryColor = useMemo(
    () => theme.primary?.val ?? "#000",
    [theme.primary?.val],
  );
  const textColor = useMemo(
    () => theme.descriptionText?.val ?? "#111",
    [theme.descriptionText?.val],
  );
  const placeholderColor = useMemo(
    () => theme.placeholder?.val ?? "#9ca3af",
    [theme.placeholder?.val],
  );
  const pressedBg = useMemo(
    () => theme.backgroundSecondary?.val ?? "#f3f4f6",
    [theme.backgroundSecondary?.val],
  );
  const inputBg = useMemo(
    () => theme.inputBackground?.val ?? "#f9fafb",
    [theme.inputBackground?.val],
  );
  const borderColor = useMemo(
    () => theme.inputBorderColor?.val ?? "#e5e7eb",
    [theme.inputBorderColor?.val],
  );
  const bgColor = useMemo(
    () => theme.background?.val ?? "#fff",
    [theme.background?.val],
  );

  if (!open) return null;

  return (
    <BottomDrawer
      open={open}
      onOpenChange={onClose}
      headerTitle={title}
      height={70}
      scrollEnabled={true}
    >
      {/* Search Input */}
      <XStack
        height={50}
        paddingHorizontal={16}
        borderRadius={12}
        borderWidth={1}
        borderColor={borderColor}
        alignItems="center"
        backgroundColor={inputBg}
        marginBottom="$3"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.05}
        shadowRadius={3.84}
      >
        <TextInput
          placeholder="Search..."
          value={searchText}
          onChangeText={handleSearchChange}
          placeholderTextColor={placeholderColor}
          style={{
            flex: 1,
            fontSize: 16,
            color: textColor,
          }}
          editable={!isLoading}
        />
      </XStack>

      <View
        style={{
          overflow: "hidden",
          backgroundColor: bgColor,
          maxHeight: 350,
        }}
      >
        <ScrollView
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          onScroll={(e) => {
            if (!onEndReached) return;
            const { contentOffset, contentSize, layoutMeasurement } =
              e.nativeEvent;
            if (
              contentOffset.y + layoutMeasurement.height >=
              contentSize.height - 20
            ) {
              onEndReached();
            }
          }}
          scrollEventThrottle={16}
        >
          {isLoading && filtered.length === 0 ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: placeholderColor,
                  textAlign: "center",
                }}
              >
                Loading...
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: placeholderColor,
                  textAlign: "center",
                }}
              >
                No options found
              </Text>
            </View>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  key={`${item.value}_${idx}`}
                  onPress={() => handleSelect(item.value)}
                >
                  {({ pressed }) => (
                    <View
                      style={{
                        marginHorizontal: 8,
                        marginVertical: 6,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: pressed
                          ? `${primaryColor}05`
                          : "transparent",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isSelected ? primaryColor : borderColor,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: isSelected ? "600" : "400",
                          color: isSelected ? primaryColor : textColor,
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </Text>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: isSelected ? primaryColor : borderColor,
                          backgroundColor: isSelected
                            ? primaryColor
                            : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: 12,
                        }}
                      >
                        {isSelected && (
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "white",
                            }}
                          />
                        )}
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </BottomDrawer>
  );
};

export const SearchSelectSheet = memo(SearchSelectSheetComponent);
SearchSelectSheet.displayName = "SearchSelectSheet";
