import { CustomerFormData } from "../../../app/features/customer/types";
import { getStepProgress } from "../../../app/features/customer/validation";
import { Check } from "lucide-react-native";
import { Text, XStack } from "tamagui";

type Props = {
  current: number;
  total: number;
  form: CustomerFormData;
};

export function StepIndicator({ current, total, form }: Props) {
  return (
    <XStack
      alignItems="center"
      paddingVertical="$4"
      paddingHorizontal="$4"
      width="100%"
    >
      {Array.from({ length: total }).map((_, i) => {
        const step = i + 1;
        const isCompleted = step < current;
        const isActive = step === current;
        const progress = isActive
          ? getStepProgress(step, form)
          : isCompleted
            ? 1
            : 0;

        const circleColor = isCompleted
          ? "$success"
          : isActive
            ? "$ongoing"
            : "$background";
        const lineFillColor = isCompleted ? "$success" : "$ongoing";

        // Render circle and line as separate elements with proper keys
        const elements = [
          <XStack
            key={`circle-${step}`}
            width={44}
            height={44}
            borderRadius={22}
            alignItems="center"
            justifyContent="center"
            backgroundColor={isActive ? "$ongoingBackground" : "transparent"}
            zIndex={1}
          >
            <XStack
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor={circleColor}
              borderWidth={isCompleted || isActive ? 0 : 2}
              borderColor="$borderThinColor"
              alignItems="center"
              justifyContent="center"
            >
              {isCompleted ? (
                <Check size={18} color="white" strokeWidth={3} />
              ) : (
                <Text
                  fontSize="$3"
                  fontWeight="700"
                  color={isActive ? "white" : "$secondaryText"}
                >
                  {step}
                </Text>
              )}
            </XStack>
          </XStack>,
        ];

        // Add line after circle if not last step
        if (step < total) {
          elements.push(
            <XStack
              key={`line-${step}`}
              flex={1}
              marginHorizontal="$3"
              height={6}
            >
              <XStack
                width="100%"
                height={4}
                borderRadius={999}
                backgroundColor="$inputBorderColor"
                overflow="hidden"
              >
                <XStack
                  height="100%"
                  backgroundColor={lineFillColor}
                  width={`${Math.max(progress * 100, 0)}%` as any}
                />
              </XStack>
            </XStack>,
          );
        }

        return elements;
      })}
    </XStack>
  );
}
