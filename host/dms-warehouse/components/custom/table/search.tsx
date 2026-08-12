import { Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Button, Spinner, useTheme, XStack } from "tamagui";
import { AppInput } from "../input";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search here ...",
  debounceMs = 500,
  loading = false,
}: SearchProps) {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
        onSearch?.(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    onSearch?.("");
  };

  return (
    <XStack gap="$3" alignItems="center">
      <XStack flex={1} position="relative" alignItems="center">
        {/* Search icon on the left */}
        <Search
          size={18}
          color={theme.placeholder?.val}
          style={{ position: "absolute", left: 14, zIndex: 1 }}
        />

        <AppInput
          flex={1}
          placeholder={placeholder}
          placeholderTextColor="$placeholder"
          value={localValue}
          onChangeText={setLocalValue}
          backgroundColor="$inputBackground"
          height={50}
          borderWidth={1}
          borderColor="$inputBorderColor"
          borderRadius="$3"
          paddingLeft={40}
          paddingRight="$8"
          fontSize={16}
        />

        {localValue.length > 0 && (
          <Button
            position="absolute"
            right={16}
            size="$2"
            chromeless
            circular
            icon={<X size={16} pointerEvents="none" />}
            onPress={handleClear}
          />
        )}
      </XStack>

      {loading && <Spinner size="small" />}
    </XStack>
  );
}
