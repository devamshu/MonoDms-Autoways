import { Text, XStack, YStack } from "tamagui";

export interface RadioOption {
  label: string;
  value: string;
}

interface Props {
  label?: string;
  required?: boolean;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

// Lightweight radio group — no radio primitive exists in the codebase, and this
// is the only place that needs one (Inquiry Kind in Step 1).
export function RadioGroup({
  label,
  required,
  options,
  value,
  onChange,
}: Props) {
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

      <XStack gap="$3" flexWrap="wrap">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <XStack
              key={opt.value}
              onPress={() => onChange(opt.value)}
              cursor="pointer"
              alignItems="center"
              gap="$2"
              paddingVertical="$2"
            >
              <XStack
                width={18}
                height={18}
                borderRadius={9}
                borderWidth={2}
                borderColor={selected ? "$primary" : "$borderColor"}
                alignItems="center"
                justifyContent="center"
              >
                {selected && (
                  <XStack
                    width={8}
                    height={8}
                    borderRadius={4}
                    backgroundColor="$primary"
                  />
                )}
              </XStack>

              <Text fontSize="$4" fontWeight="400" color="$color">
                {opt.label}
              </Text>
            </XStack>
          );
        })}
      </XStack>
    </YStack>
  );
}
