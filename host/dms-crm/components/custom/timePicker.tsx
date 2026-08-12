import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

const PRIMARY = "#5B50E8";
const BODY_TEXT = "#1A1A2E";
const SECONDARY_TEXT = "#9E9E9E";
const BORDER = "#EFEFEF";

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
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "80%",
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#DDD",
              alignSelf: "center",
              marginTop: 10,
              marginBottom: 4,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: BORDER,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: BODY_TEXT }}>
              Select Time
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: SECONDARY_TEXT,
                  fontWeight: "500",
                }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            {TIME_SLOTS.map((slot) => {
              const isSelected = tempTime === slot.value;
              return (
                <TouchableOpacity
                  key={slot.value}
                  onPress={() => setTempTime(slot.value)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    gap: 14,
                    backgroundColor: isSelected ? "#F5F4FE" : "transparent",
                  }}
                >
                  {/* Radio */}
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: isSelected ? "" : "#D0D0D0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: PRIMARY,
                        }}
                      />
                    )}
                  </View>

                  {/* Label */}
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: isSelected ? "600" : "400",
                      color: isSelected ? BODY_TEXT : SECONDARY_TEXT,
                    }}
                  >
                    {slot.display}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Save Button */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: BORDER,
            }}
          >
            <TouchableOpacity
              onPress={handleSave}
              disabled={!tempTime}
              activeOpacity={0.85}
              style={{
                backgroundColor: tempTime ? PRIMARY : "#C4BAF5",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                ...(tempTime && {
                  shadowColor: PRIMARY,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }),
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
