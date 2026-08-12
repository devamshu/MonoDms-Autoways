// src/components/custom/filter/GenericFilterModal.tsx
import { ChevronDown, RotateCcw } from "lucide-react-native";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Pressable, Text, View } from "react-native";
import { XStack, YStack, useTheme } from "tamagui";
import { Button as Custom } from "../buttons/button";
import { BottomDrawer } from "../drawer";
import { Dropdown } from "../dropdown";
import { AppInput } from "../input";
import { FilterField } from "./filter";
import { SearchSelectSheet } from "./SearchSelectSheet";

interface GenericFilterModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  fields: FilterField[];
  initialValues: Record<string, any>;
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
  drawerHeight?: number;
}

export const GenericFilterModal = memo(
  ({
    visible,
    onClose,
    title,
    fields,
    initialValues,
    onApply,
    onReset,
    drawerHeight = 80,
  }: GenericFilterModalProps) => {
    const theme = useTheme();
    const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, any[]>>(
      {},
    );
    const [loadingOptions, setLoadingOptions] = useState<
      Record<string, boolean>
    >({});
    const [fieldPagination, setFieldPagination] = useState<
      Record<string, { page: number; hasMore: boolean; loadingMore: boolean }>
    >({});
    const [selectedSearchFieldId, setSelectedSearchFieldId] = useState<
      string | null
    >(null);

    // Track which fields have already been loaded to prevent multiple API calls
    const loadedFieldsRef = useRef<Set<string>>(new Set());

    // Memoize theme colors to prevent unnecessary recalculations
    const themeColors = useMemo(
      () => ({
        primary: theme.primary?.val ?? "#000",
        error: theme.error?.val ?? "#ef4444",
        inputBorderColor: theme.inputBorderColor?.val ?? "#e5e7eb",
        inputBackground: theme.inputBackground?.val ?? "#f9fafb",
        descriptionText: theme.descriptionText?.val ?? "#111",
        placeholder: theme.placeholder?.val ?? "#9ca3af",
        secondaryText: theme.secondaryText?.val ?? "#666",
        borderColor: theme.borderColor?.val ?? "#ccc",
        color: theme.color?.val ?? "#111",
      }),
      [
        theme.primary?.val,
        theme.error?.val,
        theme.inputBorderColor?.val,
        theme.inputBackground?.val,
        theme.descriptionText?.val,
        theme.placeholder?.val,
        theme.secondaryText?.val,
        theme.borderColor?.val,
        theme.color?.val,
      ],
    );

    // Reset local filters when modal becomes visible
    useEffect(() => {
      if (visible) {
        // Start with current applied filters (initialValues)
        setLocalFilters({ ...initialValues });
      }
    }, [visible, initialValues]);

    // Clear local filters when modal closes
    useEffect(() => {
      if (!visible) {
        setLocalFilters({});
        setSelectedSearchFieldId(null);
        // Don't clear loadedFieldsRef - keep cached options for next open
      }
    }, [visible]);

    // Load dynamic options when modal opens - only load once per field
    useEffect(() => {
      if (!visible) return;

      const loadFieldOptions = async (field: FilterField) => {
        // Skip if already loaded
        if (loadedFieldsRef.current.has(field.id)) return;

        if (field.paginatedOptionsLoader) {
          loadedFieldsRef.current.add(field.id);
          setLoadingOptions((prev) => ({ ...prev, [field.id]: true }));
          try {
            const { options, hasMore } = await field.paginatedOptionsLoader(1);
            const optionsWithKeys = options.map((opt, idx) => ({
              ...opt,
              key: `${field.id}_${opt.value}_${idx}`,
            }));
            setDynamicOptions((prev) => ({
              ...prev,
              [field.id]: optionsWithKeys,
            }));
            setFieldPagination((prev) => ({
              ...prev,
              [field.id]: { page: 1, hasMore, loadingMore: false },
            }));
          } catch (error) {
            console.error(`Failed to load options for ${field.id}:`, error);
            loadedFieldsRef.current.delete(field.id);
          } finally {
            setLoadingOptions((prev) => ({ ...prev, [field.id]: false }));
          }
        } else if (field.optionsLoader) {
          loadedFieldsRef.current.add(field.id);
          setLoadingOptions((prev) => ({ ...prev, [field.id]: true }));
          try {
            const options = await field.optionsLoader();
            const optionsWithKeys = options.map((opt, idx) => ({
              ...opt,
              key: `${field.id}_${opt.value}_${idx}`,
            }));
            setDynamicOptions((prev) => ({
              ...prev,
              [field.id]: optionsWithKeys,
            }));
          } catch (error) {
            console.error(`Failed to load options for ${field.id}:`, error);
            loadedFieldsRef.current.delete(field.id);
          } finally {
            setLoadingOptions((prev) => ({ ...prev, [field.id]: false }));
          }
        }
      };

      // Load options for all fields in parallel
      Promise.all(fields.map((field) => loadFieldOptions(field)));
    }, [visible]);

    const loadMoreOptions = useCallback(
      async (field: FilterField) => {
        if (!field.paginatedOptionsLoader) return;
        const pagination = fieldPagination[field.id];
        if (!pagination || pagination.loadingMore || !pagination.hasMore) {
          return;
        }

        setFieldPagination((prev) => ({
          ...prev,
          [field.id]: { ...prev[field.id], loadingMore: true },
        }));

        try {
          const nextPage = pagination.page + 1;
          const { options, hasMore } =
            await field.paginatedOptionsLoader(nextPage);
          const optionsWithKeys = options.map((opt, idx) => ({
            ...opt,
            key: `${field.id}_${opt.value}_${idx}`,
          }));
          setDynamicOptions((prev) => ({
            ...prev,
            [field.id]: optionsWithKeys,
          }));
          setFieldPagination((prev) => ({
            ...prev,
            [field.id]: { page: nextPage, hasMore, loadingMore: false },
          }));
        } catch (error) {
          console.error(`Failed to load more options for ${field.id}:`, error);
          setFieldPagination((prev) => ({
            ...prev,
            [field.id]: { ...prev[field.id], loadingMore: false },
          }));
        }
      },
      [fieldPagination],
    );

    const handleChange = useCallback((id: string, value: any) => {
      setLocalFilters((prev) => ({ ...prev, [id]: value }));
    }, []);

    const handleApply = useCallback(() => {
      if (__DEV__) {
        console.log(`[Filters] ${title} applied:`, localFilters);
      }
      onApply(localFilters);
      onClose();
    }, [localFilters, onApply, onClose, title]);

    const handleReset = useCallback(() => {
      onReset();
      onClose();
    }, [onReset, onClose]);

    const getVisibleFields = useCallback((): FilterField[] => {
      return fields.filter((field) => {
        if (field.visible) {
          return field.visible(localFilters);
        }
        return true;
      });
    }, [fields, localFilters]);

    const renderField = useCallback(
      (field: FilterField) => {
        const value = localFilters[field.id];
        const options = dynamicOptions[field.id] || field.options || [];
        const isLoading = loadingOptions[field.id];

        switch (field.type) {
          case "select":
            if (isLoading) {
              return (
                <View style={{ padding: 10 }}>
                  <Text
                    style={{
                      color: themeColors.secondaryText,
                      textAlign: "center",
                    }}
                  >
                    Loading options...
                  </Text>
                </View>
              );
            }
            return (
              <Dropdown
                placeholder={field.placeholder || `Select ${field.label}`}
                options={options}
                value={value || ""}
                onChange={(selectedValue) =>
                  handleChange(field.id, selectedValue)
                }
                disabled={field.disabled}
                error={field.error}
                onEndReached={
                  field.paginatedOptionsLoader
                    ? () => loadMoreOptions(field)
                    : undefined
                }
                loadingMore={fieldPagination[field.id]?.loadingMore}
              />
            );

          case "search-select": {
            const selectedLabel =
              options.find((o) => o.value === value)?.label || "";
            return (
              <YStack gap="$2">
                <Pressable
                  onPress={() =>
                    !field.disabled && setSelectedSearchFieldId(field.id)
                  }
                  disabled={field.disabled}
                >
                  {({ pressed }) => (
                    <XStack
                      height={50}
                      paddingHorizontal={16}
                      borderRadius={12}
                      borderWidth={1}
                      alignItems="center"
                      justifyContent="space-between"
                      backgroundColor={themeColors.inputBackground}
                      borderColor={
                        field.error
                          ? themeColors.error
                          : selectedSearchFieldId === field.id
                            ? themeColors.primary
                            : themeColors.inputBorderColor
                      }
                      opacity={field.disabled ? 0.45 : pressed ? 0.85 : 1}
                      shadowColor="$black"
                      shadowOffset={{ width: 0, height: 4 }}
                      shadowOpacity={0.05}
                      shadowRadius={3.84}
                      elevation={5}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "400",
                          color: value
                            ? themeColors.descriptionText
                            : themeColors.placeholder,
                          flex: 1,
                          opacity: value ? 1 : 0.65,
                        }}
                        numberOfLines={1}
                      >
                        {selectedLabel ||
                          field.placeholder ||
                          `Select ${field.label}`}
                      </Text>
                      <ChevronDown
                        size={18}
                        color={themeColors.descriptionText}
                      />
                    </XStack>
                  )}
                </Pressable>
                {field.error && (
                  <Text style={{ color: themeColors.error, fontSize: 12 }}>
                    {field.error}
                  </Text>
                )}
              </YStack>
            );
          }

          case "multi-select":
            if (isLoading) {
              return (
                <View style={{ padding: 10 }}>
                  <Text
                    style={{
                      color: themeColors.secondaryText,
                      textAlign: "center",
                    }}
                  >
                    Loading options...
                  </Text>
                </View>
              );
            }
            return (
              <YStack gap="$2">
                {options.map((option, idx) => {
                  const isSelected = (value || []).includes(option.value);
                  const uniqueKey =
                    option.key || `${field.id}_${option.value}_${idx}`;
                  return (
                    <View
                      key={uniqueKey}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: themeColors.borderColor,
                          backgroundColor: isSelected
                            ? themeColors.primary
                            : "transparent",
                          marginRight: 12,
                        }}
                      />
                      <Text
                        style={{ color: themeColors.color }}
                        onPress={() => {
                          const current = value || [];
                          const newValue = isSelected
                            ? current.filter((v: any) => v !== option.value)
                            : [...current, option.value];
                          handleChange(field.id, newValue);
                        }}
                      >
                        {option.label}
                      </Text>
                    </View>
                  );
                })}
              </YStack>
            );

          case "radio":
            if (isLoading) {
              return (
                <View style={{ padding: 10 }}>
                  <Text
                    style={{
                      color: themeColors.secondaryText,
                      textAlign: "center",
                    }}
                  >
                    Loading options...
                  </Text>
                </View>
              );
            }
            return (
              <YStack gap="$2">
                {options.map((option, idx) => {
                  const uniqueKey =
                    option.key || `${field.id}_${option.value}_${idx}`;
                  return (
                    <View
                      key={uniqueKey}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: themeColors.borderColor,
                          backgroundColor:
                            value === option.value
                              ? themeColors.primary
                              : "transparent",
                          marginRight: 12,
                        }}
                      />
                      <Text
                        style={{ color: themeColors.color }}
                        onPress={() => handleChange(field.id, option.value)}
                      >
                        {option.label}
                      </Text>
                    </View>
                  );
                })}
              </YStack>
            );

          case "date-range":
            return (
              <YStack gap="$2">
                <Text style={{ color: themeColors.secondaryText, fontSize: 12 }}>
                  From Date
                </Text>
                <AppInput
                  placeholder="YYYY-MM-DD"
                  value={value?.from || ""}
                  onChangeText={(text) =>
                    handleChange(field.id, { ...value, from: text })
                  }
                />
                <Text
                  style={{
                    color: themeColors.secondaryText,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  To Date
                </Text>
                <AppInput
                  placeholder="YYYY-MM-DD"
                  value={value?.to || ""}
                  onChangeText={(text) =>
                    handleChange(field.id, { ...value, to: text })
                  }
                />
              </YStack>
            );

          case "text":
            return (
              <AppInput
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value || ""}
                onChangeText={(text) => handleChange(field.id, text)}
              />
            );

          case "number":
            return (
              <AppInput
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value?.toString() || ""}
                onChangeText={(text) => handleChange(field.id, Number(text))}
                keyboardType="numeric"
              />
            );

          default:
            return null;
        }
      },
      [
        localFilters,
        handleChange,
        themeColors,
        dynamicOptions,
        loadingOptions,
        fieldPagination,
        loadMoreOptions,
        selectedSearchFieldId,
      ],
    );

    const visibleFields = useMemo(() => getVisibleFields(), [getVisibleFields]);

    const StickyButtons = useCallback(
      () => (
        <XStack gap="$3">
          <Custom
            flex={1}
            size="$4"
            buttonVariant="ghost"
            onPress={handleReset}
            icon={<RotateCcw size={18} />}
            buttonText="Reset"
          />
          <Custom
            flex={1}
            size="$4"
            buttonVariant="primary"
            onPress={handleApply}
            buttonText="Apply"
          />
        </XStack>
      ),
      [handleReset, handleApply],
    );

    if (!visible) return null;

    // Get the currently selected field for search-select sheet
    const selectedField = fields.find((f) => f.id === selectedSearchFieldId);

    return (
      <>
        <BottomDrawer
          open={visible}
          onOpenChange={onClose}
          headerTitle={title}
          stickyBottomContent={<StickyButtons />}
          height={drawerHeight}
          snapToBottom
        >
          <YStack gap="$4">
            {visibleFields.map((field) => (
              <YStack key={field.id} gap="$2">
                <XStack gap="$1" alignItems="center">
                  <Text
                    style={{
                      color: theme.color?.val,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {field.label}
                  </Text>
                  {field.required && (
                    <Text style={{ color: theme.error?.val, fontSize: 14 }}>
                      *
                    </Text>
                  )}
                </XStack>

                {renderField(field)}

                {field.error && (
                  <Text style={{ color: theme.error?.val, fontSize: 12 }}>
                    {field.error}
                  </Text>
                )}
              </YStack>
            ))}
          </YStack>
        </BottomDrawer>

        {selectedField && selectedField.type === "search-select" && (
          <SearchSelectSheet
            open={selectedSearchFieldId !== null}
            onClose={() => setSelectedSearchFieldId(null)}
            options={
              dynamicOptions[selectedField.id] || selectedField.options || []
            }
            value={localFilters[selectedField.id] || ""}
            onChange={(v) => handleChange(selectedField.id, v)}
            title={selectedField.label}
            isLoading={loadingOptions[selectedField.id]}
            onEndReached={
              selectedField.paginatedOptionsLoader
                ? () => loadMoreOptions(selectedField)
                : undefined
            }
          />
        )}
      </>
    );
  },
);

GenericFilterModal.displayName = "GenericFilterModal";
