// Dropdown.tsx - Fixed version with proper positioning
import { Check, ChevronDown, ChevronUp, Search, X } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { Text, useTheme, XStack, YStack } from "tamagui";

export interface DropdownOption {
  label: string;
  value: string;
}

type DropdownSize = "sm" | "md";

const DROPDOWN_SIZES: Record<
  DropdownSize,
  {
    height: number;
    paddingH: number;
    fontSize: number;
    iconSize: number;
    itemPaddingV: number;
    itemPaddingH: number;
    borderRadius: number;
  }
> = {
  sm: {
    height: 36,
    paddingH: 12,
    fontSize: 13,
    iconSize: 14,
    itemPaddingV: 8,
    itemPaddingH: 12,
    borderRadius: 8,
  },
  md: {
    height: 50,
    paddingH: 16,
    fontSize: 16,
    iconSize: 18,
    itemPaddingV: 12,
    itemPaddingH: 16,
    borderRadius: 12,
  },
};

const MENU_MAX_HEIGHT = 224;

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
  onEndReached?: () => void;
  loadingMore?: boolean;
  loading?: boolean;
  hideSearch?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  isLoadingMore?: boolean;
}

interface SearchableDropdownProps extends Omit<DropdownProps, "onChange"> {
  onChange: (value: string | undefined) => void;
}

export function Dropdown({
  label,
  required,
  placeholder = "Select",
  options = [],
  value,
  onChange,
  disabled = false,
  error,
  containerStyle,
  noShadow = false,
  size = "md",
  borderRadius,
  centered = false,
  onEndReached,
  loadingMore = false,
  loading = false,
  hideSearch = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0, width: 0 });
  const triggerRef = useRef<RNView>(null);
  const theme = useTheme();
  const s = DROPDOWN_SIZES[size];
  const { height: windowHeight } = useWindowDimensions();

  const selected = options.find((o) => o.value === value);
  const br = typeof borderRadius === "number" ? borderRadius : s.borderRadius;

  const measureAndOpen = () => {
    if (!triggerRef.current) return;

    setTimeout(() => {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        const spaceBelow = windowHeight - (y + height);
        const DROPDOWN_OFFSET = 4;
        const totalHeight = Math.min(options.length * 40, MENU_MAX_HEIGHT);

        let yPos;
        if (spaceBelow >= totalHeight + DROPDOWN_OFFSET) {
          yPos = y + height + DROPDOWN_OFFSET;
        } else {
          yPos = y - totalHeight - DROPDOWN_OFFSET;
        }

        setMenuPos({ x, y: yPos, width });
        setOpen(true);
      });
    }, 50);
  };

  const measureAndPosition = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = windowHeight - (y + height);
      const totalHeight = Math.min(options.length * 40, MENU_MAX_HEIGHT);
      const DROPDOWN_OFFSET = 4;

      let yPos;
      if (spaceBelow >= totalHeight + DROPDOWN_OFFSET) {
        yPos = y + height + DROPDOWN_OFFSET;
      } else {
        yPos = y - totalHeight - DROPDOWN_OFFSET;
      }

      setMenuPos({ x, y: yPos, width });
      setOpen(true);
    });
  };

  const handleOpen = () => {
    if (disabled) return;
    Keyboard.dismiss();
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const sub = Keyboard.addListener(hideEvt, () => {
      sub.remove();
      measureAndPosition();
    });
    setTimeout(() => {
      sub.remove();
      if (!open) measureAndPosition();
    }, 300);
  };

  const handleSelect = (item: DropdownOption) => {
    onChange(item.value);
    setOpen(false);
  };

  const bg = theme.background?.val ?? "#fff";
  const borderColor = error
    ? (theme.error?.val ?? "#ef4444")
    : open
      ? (theme.primary?.val ?? "#000")
      : (theme.inputBorderColor?.val ?? "#e5e7eb");
  const inputBg = theme.inputBackground?.val ?? "#f9fafb";
  const menuBorderColor = theme.inputBorderColor?.val ?? "#e5e7eb";
  const primaryColor = theme.primary?.val ?? "#000";
  const textColor = theme.descriptionText?.val ?? "#111";
  const placeholderColor = theme.placeholder?.val ?? "#9ca3af";
  const pressedBg = theme.backgroundSecondary?.val ?? "#f3f4f6";

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

      <RNView ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={() => (open ? setOpen(false) : handleOpen())}
          disabled={disabled}
        >
          {({ pressed }) => (
            <XStack
              height={s.height}
              paddingHorizontal={s.paddingH}
              borderRadius={br}
              borderWidth={1}
              alignItems="center"
              justifyContent={centered ? "center" : "space-between"}
              gap={centered ? "$2" : undefined}
              backgroundColor={inputBg}
              borderColor={borderColor}
              opacity={disabled ? 0.45 : pressed ? 0.85 : 1}
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
                <ChevronUp size={s.iconSize} color={textColor} />
              ) : (
                <ChevronDown size={s.iconSize} color={textColor} />
              )}
            </XStack>
          )}
        </Pressable>
      </RNView>

      <Modal
        transparent
        visible={open}
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => setOpen(false)}
        />
        <RNView
          style={{
            position: "absolute",
            left: menuPos.x,
            top: menuPos.y,
            width: menuPos.width,
            maxHeight: MENU_MAX_HEIGHT,
            backgroundColor: bg,
            overflow: "hidden",
            borderRadius: 0,
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            nestedScrollEnabled
            scrollEventThrottle={16}
            onScroll={(e) => {
              if (!onEndReached || loadingMore) return;
              const { contentOffset, contentSize, layoutMeasurement } =
                e.nativeEvent;
              if (
                contentOffset.y + layoutMeasurement.height >=
                contentSize.height - 20
              ) {
                onEndReached();
              }
            }}
          >
            {options.length === 0 && !loading && !loadingMore ? (
              <Text
                fontSize={s.fontSize}
                color="$placeholder"
                paddingHorizontal={s.itemPaddingH}
                paddingVertical={s.itemPaddingV}
              >
                No options found
              </Text>
            ) : options.length === 0 && loading ? (
              <XStack
                paddingVertical={s.itemPaddingV}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize="$2" color="$placeholder">
                  Loading...
                </Text>
              </XStack>
            ) : (
              options.map((item) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => handleSelect(item)}
                  >
                    {({ pressed }) => (
                      <XStack
                        paddingHorizontal={12}
                        paddingVertical={10}
                        alignItems="center"
                        justifyContent="space-between"
                        backgroundColor="transparent"
                      >
                        <Text
                          fontSize={s.fontSize}
                          fontWeight={isSelected ? "600" : "400"}
                          color={isSelected ? primaryColor : "$descriptionText"}
                          flex={1}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <Check size={s.iconSize - 3} color={primaryColor} />
                        )}
                      </XStack>
                    )}
                  </Pressable>
                );
              })
            )}
            {loadingMore && (
              <XStack
                paddingVertical={s.itemPaddingV}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize="$2" color="$placeholder">
                  Loading more...
                </Text>
              </XStack>
            )}
          </ScrollView>
        </RNView>
      </Modal>

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
  onEndReached,
  loadingMore = false,
  loading = false,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0, width: 0 });
  const triggerRef = useRef<RNView>(null);
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();

  const selected = options.find((o) => o.value === value);
  const hasContent = !!query || !!selected;

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const bg = theme.background?.val ?? "#fff";
  const menuBorderColor = theme.inputBorderColor?.val ?? "#e5e7eb";
  const inputBg = theme.inputBackground?.val ?? "#f9fafb";
  const borderColor = error
    ? (theme.error?.val ?? "#ef4444")
    : open
      ? (theme.primary?.val ?? "#000")
      : (theme.inputBorderColor?.val ?? "#e5e7eb");
  const primaryColor = theme.primary?.val ?? "#000";
  const textColor = theme.descriptionText?.val ?? "#111";
  const placeholderColor = theme.placeholder?.val ?? "#9ca3af";
  const pressedBg = theme.backgroundSecondary?.val ?? "#f3f4f6";

  const measureAndOpen = () => {
    if (!triggerRef.current) return;

    setTimeout(() => {
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        const spaceBelow = windowHeight - (y + height);
        const totalHeight = Math.min(filtered.length * 44, 224);
        const DROPDOWN_OFFSET = 4;

        let yPos;
        if (spaceBelow >= totalHeight + DROPDOWN_OFFSET) {
          yPos = y + height + DROPDOWN_OFFSET;
        } else {
          yPos = y - totalHeight - DROPDOWN_OFFSET;
        }

        setMenuPos({ x, y: yPos, width });
        setOpen(true);
      });
    }, 50);
  };

  const handleOpen = () => {
    if (disabled) return;
    setQuery("");
    Keyboard.dismiss();
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const sub = Keyboard.addListener(hideEvt, () => {
      sub.remove();
      triggerRef.current?.measureInWindow((x, y, width, height) => {
        const yPos = y + height + 4;
        setMenuPos({ x, y: yPos, width });
        setOpen(true);
      });
    });
    setTimeout(() => {
      sub.remove();
      if (!open) {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
          const yPos = y + height + 4;
          setMenuPos({ x, y: yPos, width });
          setOpen(true);
        });
      }
    }, 300);
  };

  const handleSelect = (item: DropdownOption) => {
    onChange(item.value);
    setQuery("");
    setOpen(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setQuery("");
  };

  const handleClose = () => {
    setQuery("");
    setOpen(false);
  };

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

      <RNView ref={triggerRef} collapsable={false}>
        <XStack
          height={50}
          paddingHorizontal="$4"
          borderRadius="$3"
          borderWidth={1}
          alignItems="center"
          gap="$2"
          backgroundColor={inputBg}
          borderColor={borderColor}
          opacity={disabled ? 0.45 : 1}
          {...(!noShadow && {
            shadowColor: "$black",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 3.84,
          })}
        >
          {open ? (
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={selected?.label ?? placeholder}
              placeholderTextColor={placeholderColor}
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 0,
                color: textColor,
              }}
              onBlur={() => setTimeout(handleClose, 150)}
            />
          ) : (
            <Pressable
              onPress={handleOpen}
              disabled={disabled}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <Text
                fontSize="$4"
                color={selected ? "$descriptionText" : "$placeholder"}
              >
                {selected ? selected.label : placeholder}
              </Text>
            </Pressable>
          )}

          {!open ? (
            <Pressable onPress={handleOpen} disabled={disabled} hitSlop={8}>
              <ChevronDown size={18} color={textColor} pointerEvents="none" />
            </Pressable>
          ) : hasContent ? (
            <Pressable onPress={handleClear} hitSlop={8}>
              <XStack
                width={22}
                height={22}
                borderRadius={11}
                backgroundColor="$secondary"
                alignItems="center"
                justifyContent="center"
              >
                <X size={12} color={primaryColor} pointerEvents="none" />
              </XStack>
            </Pressable>
          ) : (
            <Search size={18} color={placeholderColor} />
          )}
        </XStack>
      </RNView>

      <Modal
        transparent
        visible={open}
        statusBarTranslucent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleClose}
        />
        <RNView
          style={{
            position: "absolute",
            left: menuPos.x,
            top: menuPos.y,
            width: menuPos.width,
            maxHeight: 224,
            backgroundColor: bg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: menuBorderColor,
            overflow: "hidden",
            ...(!noShadow && {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
            }),
          }}
        >
          {filtered.length === 0 ? (
            <Text
              fontSize="$4"
              color="$placeholder"
              paddingHorizontal="$5"
              paddingVertical="$4"
            >
              No results
            </Text>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              nestedScrollEnabled
              scrollEventThrottle={16}
              onScroll={(e) => {
                if (!onEndReached || loadingMore) return;
                const { contentOffset, contentSize, layoutMeasurement } =
                  e.nativeEvent;
                if (
                  contentOffset.y + layoutMeasurement.height >=
                  contentSize.height - 20
                ) {
                  onEndReached();
                }
              }}
            >
              {filtered.map((item) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => handleSelect(item)}
                  >
                    {({ pressed }) => (
                      <XStack
                        paddingHorizontal="$5"
                        paddingVertical="$4"
                        backgroundColor={pressed ? pressedBg : "transparent"}
                      >
                        <Text
                          fontSize="$4"
                          fontWeight={isSelected ? "700" : "400"}
                          color="$descriptionText"
                        >
                          {item.label}
                        </Text>
                      </XStack>
                    )}
                  </Pressable>
                );
              })}
              {loadingMore && (
                <XStack
                  paddingVertical="$4"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text fontSize="$2" color="$placeholder">
                    Loading more...
                  </Text>
                </XStack>
              )}
            </ScrollView>
          )}
        </RNView>
      </Modal>

      {error && (
        <Text fontSize="$2" color="$error" paddingLeft="$1">
          {error}
        </Text>
      )}
    </YStack>
  );
}
