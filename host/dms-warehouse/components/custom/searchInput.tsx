import { Search, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Button, Input, XStack } from "tamagui";

interface SearchInputProps {
  search?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput = ({
  search,
  onChange,
  placeholder = "Search here...",
}: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(search || "");

  useEffect(() => {
    setInputValue(search || "");
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(inputValue.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [inputValue, onChange]);

  return (
    <XStack
      width={358}
      height={50}
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius={16}
      backgroundColor="$background"
      alignItems="center"
      position="relative"
      paddingLeft={40}
      paddingRight={40}
      shadowColor="#dcdcdc"
      shadowOpacity={0.02}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 4 }}
      elevation={3}
    >
      <XStack position="absolute" left={12} zIndex={1}>
        <Search size={20} color="#94a3b8" />
      </XStack>

      <Input
        flex={1}
        borderWidth={0}
        backgroundColor="transparent"
        fontSize={16}
        placeholder={placeholder}
        placeholderTextColor="$secondaryText"
        value={inputValue}
        onChangeText={setInputValue}
      />

      {inputValue.trim().length > 0 && (
        <Button
          unstyled
          position="absolute"
          right={12}
          onPress={() => {
            setInputValue("");
            onChange("");
          }}
        >
          <X size={16} color="#94a3b8" />
        </Button>
      )}
    </XStack>
  );
};

export default SearchInput;
