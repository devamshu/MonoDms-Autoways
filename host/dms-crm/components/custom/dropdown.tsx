import { Check, ChevronDown, ChevronUp, Search, X } from "lucide-react-native";
import { useCallback, useEffect, useId, useSyncExternalStore } from "react";
import { Pressable, ScrollView } from "react-native";
import { Text, useTheme, View, XStack, YStack } from "tamagui";
import { SearchSelectSheet } from "./filter/SearchSelectSheet";

export interface DropdownOption {
  label: string;
  value: string;
}

// ─── Open-dropdown registry ───────────────────────────────────────────────────
// Only one dropdown may be expanded at a time. Each instance derives its open
// state from this shared slot rather than owning a boolean, so opening one
// collapses whichever was already open — including dropdowns in sibling
// subtrees that know nothing about each other (e.g. two fields in a stepper).

let openDropdownId: string | null = null;
const listeners = new Set<() => void>();

const getOpenDropdownId = () => openDropdownId;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setOpenDropdownId = (id: string | null) => {
  if (openDropdownId === id) return;
  openDropdownId = id;
  listeners.forEach((listener) => listener());
};

function useExclusiveOpen(id: string) {
  const currentId = useSyncExternalStore(
    subscribe,
    getOpenDropdownId,
    getOpenDropdownId,
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        setOpenDropdownId(id);
      } else if (openDropdownId === id) {
        // Guarded: a stale close (the searchable variant's delayed onBlur, for
        // instance) must not shut the dropdown that just took the slot.
        setOpenDropdownId(null);
      }
    },
    [id],
  );

  // Unmounting while expanded — navigating away mid-selection — would
  // otherwise leave the slot claimed and block the next dropdown.
  useEffect(
    () => () => {
      if (openDropdownId === id) setOpenDropdownId(null);
    },
    [id],
  );

  return [currentId === id, setOpen] as const;
}

type DropdownSize = "sm" | "md";

const DROPDOWN_SIZES: Record<
  DropdownSize,
  {
    height: number;
    paddingHorizontal: string;
    fontSize: string;
    iconSize: number;
    menuTop: number;
    itemPaddingV: string;
    itemPaddingH: string;
  }
> = {
  sm: {
    height: 36,
    paddingHorizontal: "$3",
    fontSize: "$3",
    iconSize: 14,
    menuTop: 40,
    itemPaddingV: "$2",
    itemPaddingH: "$3",
  },
  md: {
    height: 50,
    paddingHorizontal: "$4",
    fontSize: "$4",
    iconSize: 18,
    menuTop: 55,
    itemPaddingV: "$4",
    itemPaddingH: "$5",
  },
};

interface DropdownProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  containerStyle?: object;
  noShadow?: boolean;
  size?: DropdownSize;
  borderRadius?: number | string;
  centered?: boolean;
  // Paginated option sets: called as the picker's list nears its end.
  onEndReached?: () => void;
  loadingMore?: boolean;
  loading?: boolean;
}

interface SearchableDropdownProps extends Omit<DropdownProps, "onChange"> {
  onChange: (value: string | undefined) => void;
}

export function Dropdown({
  label,
  required,
  placeholder = "Select",
  options,
  value,
  onChange,
  disabled = false,
  error,
  containerStyle,
  noShadow = false,
  size = "md",
  borderRadius = "$3",
  centered = false,
  onEndReached,
  loadingMore = false,
  loading = false,
}: DropdownProps) {
  const [open, setOpen] = useExclusiveOpen(useId());
  const theme = useTheme();
  const s = DROPDOWN_SIZES[size];

  const selected = options.find((o) => o.value === value);

  // Form-sized selects present their options in a searchable bottom sheet
  // instead of an inline menu: the lists are master data (dealers, vehicles,
  // cities) that need a search, and an absolutely-positioned menu inside a
  // stepper or a drawer gets clipped by whatever it overflows. The compact
  // `sm` variant — the page-size picker in the pagination bar — keeps the
  // inline menu, where a full sheet for three options would be absurd.
  const useSheet = size !== "sm";

  const handleSelect = (item: DropdownOption) => {
    onChange(item.value);
    setOpen(false);
  };

  return (
    <YStack gap="$2" style={containerStyle}>
      {label && (
        <XStack gap="$1" alignItems="center">
          <Text fontSize="$3" fontWeight="600" color="$descriptionText">
            {label}
          </Text>
          {required && (
            <Text fontSize="$3" color="$error">
              *
            </Text>
          )}
        </XStack>
      )}

      {/* Dropdown container with relative positioning */}
      <YStack position="relative" zIndex={open ? 1000 : 1}>
        <Pressable
          onPress={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          <XStack
            height={s.height}
            paddingHorizontal={s.paddingHorizontal}
            borderRadius={borderRadius}
            borderWidth={1}
            alignItems="center"
            justifyContent={centered ? "center" : "space-between"}
            gap={centered ? "$2" : undefined}
            backgroundColor={theme.inputBackground?.val}
            borderColor={
              error
                ? theme.error?.val
                : open
                  ? theme.primary?.val
                  : theme.inputBorderColor?.val
            }
            opacity={disabled ? 0.45 : 1}
            {...(!noShadow && {
              shadowColor: "$black",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 3.84,
            })}
          >
            <Text
              fontSize={s.fontSize}
              color={selected ? "$descriptionText" : "$placeholder"}
              flex={centered ? undefined : 1}
              numberOfLines={1}
            >
              {selected ? selected.label : placeholder}
            </Text>
            {open ? (
              <ChevronUp size={s.iconSize} color={theme.descriptionText?.val} />
            ) : (
              <ChevronDown
                size={s.iconSize}
                color={theme.descriptionText?.val}
              />
            )}
          </XStack>
        </Pressable>

        {/* Absolute positioned dropdown menu — compact variant only */}
        {open && !useSheet && (
          <>
            {/* Backdrop overlay */}
            <Pressable
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
              }}
              onPress={() => setOpen(false)}
            />

            <View
              position="absolute"
              top={s.menuTop}
              left={0}
              right={0}
              backgroundColor="$background"
              borderWidth={1}
              borderColor="$inputBorderColor"
              borderRadius="$3"
              overflow="hidden"
              zIndex={1000}
              {...(!noShadow && {
                shadowColor: "$black",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              })}
            >
              <ScrollView
                style={{ maxHeight: 260 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {options.map((item) => {
                  const isSelected = item.value === value;
                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => handleSelect(item)}
                    >
                      {({ pressed }) => (
                        <XStack
                          paddingHorizontal={s.itemPaddingH}
                          paddingVertical={s.itemPaddingV}
                          alignItems="center"
                          justifyContent="space-between"
                          backgroundColor={
                            pressed ? "$backgroundSecondary" : "transparent"
                          }
                        >
                          <Text
                            fontSize={s.fontSize}
                            fontWeight={isSelected ? "700" : "400"}
                            color="$descriptionText"
                            flex={1}
                          >
                            {item.label}
                          </Text>
                          {isSelected && (
                            <Check
                              size={s.iconSize - 2}
                              color={theme.primary?.val}
                            />
                          )}
                        </XStack>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </>
        )}
      </YStack>

      {useSheet && (
        <SearchSelectSheet
          open={open}
          onClose={() => setOpen(false)}
          options={options}
          value={value ?? ""}
          onChange={(next) => {
            onChange(next);
            setOpen(false);
          }}
          title={label ? `Select ${label}` : placeholder}
          isLoading={loading}
          loadingMore={loadingMore}
          onEndReached={onEndReached}
        />
      )}

      {error && (
        <Text fontSize="$2" color="$error" paddingLeft="$1">
          {error}
        </Text>
      )}
    </YStack>
  );
}

// ─── Searchable Dropdown ──────────────────────────────────────────────────────

export function SearchableDropdown({
  label,
  required,
  placeholder = "Select",
  options,
  value,
  onChange,
  disabled = false,
  error,
  noShadow = false,
}: SearchableDropdownProps) {
  const [open, setOpen] = useExclusiveOpen(useId());
  const theme = useTheme();

  const selected = options.find((o) => o.value === value);

  // Searching now happens in the sheet, so this component is just the trigger:
  // the inline filter-as-you-type input, its delayed-onBlur close and the
  // absolutely-positioned results menu are all gone.
  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
  };

  const handleClear = () => onChange(undefined);

  return (
    <YStack gap="$2">
      {label && (
        <XStack gap="$1" alignItems="center">
          <Text fontSize="$3" fontWeight="600" color="$descriptionText">
            {label}
          </Text>
          {required && (
            <Text fontSize="$3" color="$error">
              *
            </Text>
          )}
        </XStack>
      )}

      {/* Dropdown container with relative positioning */}
      <YStack position="relative" zIndex={open ? 1000 : 1}>
        {/* Trigger / Input */}
        <XStack
          height={50}
          paddingHorizontal="$4"
          borderRadius="$3"
          borderWidth={1}
          alignItems="center"
          gap="$2"
          backgroundColor={theme.inputBackground?.val}
          borderColor={
            error
              ? theme.error?.val
              : open
                ? theme.primary?.val
                : theme.inputBorderColor?.val
          }
          opacity={disabled ? 0.45 : 1}
          {...(!noShadow && {
            shadowColor: "$black",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 3.84,
          })}
        >
          <Pressable
            onPress={handleOpen}
            disabled={disabled}
            style={{ flex: 1, justifyContent: "center" }}
          >
            <Text
              fontSize="$4"
              numberOfLines={1}
              color={selected ? "$descriptionText" : "$placeholder"}
            >
              {selected ? selected.label : placeholder}
            </Text>
          </Pressable>

          {/* Clear when something is picked, otherwise open the picker */}
          {selected ? (
            <Pressable onPress={handleClear} hitSlop={8}>
              <XStack
                width={22}
                height={22}
                borderRadius={11}
                backgroundColor="$secondary"
                alignItems="center"
                justifyContent="center"
              >
                <X size={12} color={theme.primary?.val} />
              </XStack>
            </Pressable>
          ) : (
            <Pressable onPress={handleOpen} disabled={disabled} hitSlop={8}>
              <Search size={18} color={theme.placeholder?.val} />
            </Pressable>
          )}
        </XStack>
      </YStack>

      <SearchSelectSheet
        open={open}
        onClose={() => setOpen(false)}
        options={options}
        value={value ?? ""}
        onChange={(next) => {
          onChange(next);
          setOpen(false);
        }}
        title={label ? `Select ${label}` : placeholder}
      />

      {error && (
        <Text fontSize="$2" color="$error" paddingLeft="$1">
          {error}
        </Text>
      )}
    </YStack>
  );
}
