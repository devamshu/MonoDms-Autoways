import { X } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, TouchableOpacity } from "react-native";
import { ScrollView, Separator, Text, View, XStack, YStack } from "tamagui";

const TIME_SLOTS = [
  { display: "9:00 AM", value: "09:00" },
  { display: "9:15 AM", value: "09:15" },
  { display: "9:30 AM", value: "09:30" },
  { display: "9:45 AM", value: "09:45" },
  { display: "10:00 AM", value: "10:00" },
  { display: "10:30 AM", value: "10:30" },
  { display: "11:00 AM", value: "11:00" },
  { display: "11:30 AM", value: "11:30" },
  { display: "11:45 AM", value: "11:45" },
  { display: "12:00 PM", value: "12:00" },
  { display: "12:15 PM", value: "12:15" },
  { display: "12:30 PM", value: "12:30" },
  { display: "12:45 PM", value: "12:45" },
  { display: "1:00 PM", value: "13:00" },
  { display: "1:30 PM", value: "13:30" },
  { display: "2:00 PM", value: "14:00" },
  { display: "2:30 PM", value: "14:30" },
  { display: "3:00 PM", value: "15:00" },
  { display: "3:30 PM", value: "15:30" },
  { display: "4:00 PM", value: "16:00" },
  { display: "4:30 PM", value: "16:30" },
  { display: "5:00 PM", value: "17:00" },
];

interface TimePickerProps {
  selectedTime?: string | null;
  onTimeSelect: (time24: string, displayTime: string) => void;
  onClose: () => void;
  visible: boolean;
}

export function TimePicker({
  selectedTime,
  onTimeSelect,
  onClose,
  visible,
}: TimePickerProps) {
  const [tempTime, setTempTime] = useState<string | null>(
    selectedTime || "09:00",
  );

  const handleSave = () => {
    if (tempTime) {
      const slot = TIME_SLOTS.find((s) => s.value === tempTime);
      onTimeSelect(tempTime, slot?.display ?? tempTime);
      onClose();
    }
  };

  const handleClose = () => {
    setTempTime(selectedTime || "09:00");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      {/* Overlay */}
      <YStack
        flex={1}
        backgroundColor="rgba(0,0,0,0.4)"
        justifyContent="flex-end"
      >
        {/* Sheet */}
        <YStack
          backgroundColor="$background"
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          maxHeight="80%"
        >
          {/* Drag handle */}
          <View
            width={40}
            height={4}
            borderRadius={2}
            backgroundColor="$borderColor"
            alignSelf="center"
            marginTop="$2"
            marginBottom="$1"
          />

          {/* Header */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="$4"
            paddingVertical="$3"
          >
            <Text fontSize={18} fontWeight="700" color="$descriptionText">
              Select Time
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={8}>
              <XStack
                width={32}
                height={32}
                alignItems="center"
                justifyContent="center"
              >
                <X size={18} color="#9E9E9E" />
              </XStack>
            </TouchableOpacity>
          </XStack>

          <Separator borderColor="$borderColor" />

          {/* Time list */}
          <ScrollView showsVerticalScrollIndicator={false} paddingVertical="$2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = tempTime === slot.value;
              return (
                <TouchableOpacity
                  key={slot.value}
                  onPress={() => setTempTime(slot.value)}
                  activeOpacity={0.7}
                >
                  <XStack
                    alignItems="center"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                    gap="$3"
                    backgroundColor={isSelected ? "$secondary" : "transparent"}
                  >
                    {/* Radio */}
                    <XStack
                      width={20}
                      height={20}
                      borderRadius={10}
                      borderWidth={2}
                      borderColor={isSelected ? "$primary" : "$borderColor"}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isSelected && (
                        <View
                          width={10}
                          height={10}
                          borderRadius={5}
                          backgroundColor="$primary"
                        />
                      )}
                    </XStack>

                    {/* Label */}
                    <Text
                      fontSize={15}
                      fontWeight={isSelected ? "600" : "400"}
                      color={isSelected ? "$descriptionText" : "$secondaryText"}
                    >
                      {slot.display}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Separator borderColor="$borderColor" />

          {/* Save button */}
          <YStack paddingHorizontal="$4" paddingVertical="$4">
            <TouchableOpacity
              onPress={handleSave}
              disabled={!tempTime}
              activeOpacity={0.85}
            >
              <XStack
                backgroundColor={tempTime ? "$primary" : "$disabled"}
                borderRadius={12}
                paddingVertical="$4"
                alignItems="center"
                justifyContent="center"
                shadowColor={tempTime ? "$primary" : "transparent"}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={tempTime ? 0.3 : 0}
                shadowRadius={8}
                elevation={tempTime ? 4 : 0}
              >
                <Text
                  color="$white"
                  fontSize={16}
                  fontWeight="700"
                  letterSpacing={0.3}
                >
                  Save
                </Text>
              </XStack>
            </TouchableOpacity>
          </YStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
