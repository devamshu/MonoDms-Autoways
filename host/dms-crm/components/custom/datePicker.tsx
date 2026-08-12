import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "tamagui";

interface DatePickerProps {
  selectedDate?: Date | null;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  visible: boolean;
  minDate?: Date;
}

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

export function DatePicker({
  selectedDate,
  onDateSelect,
  onClose,
  visible,
  minDate = new Date(),
}: DatePickerProps) {
  const theme = useTheme();

  // Pulled from the Tamagui theme so the sheet follows light/dark like the
  // rest of the app instead of the hardcoded light palette it used to ship.
  const PRIMARY = theme.primary?.val ?? "#6362E7";
  const SURFACE = theme.background?.val ?? "#FFFFFF";
  const BODY_TEXT = theme.color?.val ?? "#1E1E1E";
  const SECONDARY_TEXT = theme.secondaryText?.val ?? "#495A69";
  const MUTED_TEXT = theme.disabled?.val ?? "#B1BAC2";
  const BORDER = theme.inputBorderColor?.val ?? "#E0E7EB";
  const HANDLE = theme.borderColor?.val ?? "#BFCDD9";
  const ON_PRIMARY = theme.white?.val ?? "#FFFFFF";

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [tempDate, setTempDate] = useState<Date | null>(selectedDate || null);

  const generateCalendarDays = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days: Array<{
      day: number;
      date: Date;
      isPast: boolean;
      isSelected: boolean;
    } | null> = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        day: i,
        date,
        isPast: date < today,
        isSelected: !!(
          tempDate &&
          tempDate.getDate() === i &&
          tempDate.getMonth() === month &&
          tempDate.getFullYear() === year
        ),
      });
    }
    return days;
  };

  const currentYear = currentMonth.getFullYear();
  const currentMonthIdx = currentMonth.getMonth();
  const days = generateCalendarDays(currentYear, currentMonthIdx);

  const nextMonthDate = new Date(currentYear, currentMonthIdx + 1, 1);
  const nextYear = nextMonthDate.getFullYear();
  const nextMonthIdx = nextMonthDate.getMonth();
  const nextDays = generateCalendarDays(nextYear, nextMonthIdx);

  const canGoPrev =
    new Date(currentYear, currentMonthIdx, 1) >
    new Date(today.getFullYear(), today.getMonth(), 1);

  const handleSave = () => {
    if (tempDate) {
      onDateSelect(tempDate);
      onClose();
    }
  };

  const renderMonth = (
    monthDays: typeof days,
    year: number,
    monthIdx: number,
    isSecondary = false,
  ) => (
    <View style={{ marginBottom: 8 }}>
      {/* Month Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 10,
        }}
      >
        {!isSecondary ? (
          <TouchableOpacity
            onPress={() =>
              canGoPrev &&
              setCurrentMonth(new Date(currentYear, currentMonthIdx - 1, 1))
            }
            disabled={!canGoPrev}
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              opacity: canGoPrev ? 1 : 0.3,
            }}
          >
            <Text style={{ fontSize: 24, color: BODY_TEXT, lineHeight: 28 }}>
              ‹
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        <Text style={{ fontSize: 16, fontWeight: "700", color: BODY_TEXT }}>
          {MONTH_NAMES[monthIdx]} {year}
        </Text>

        {!isSecondary ? (
          <TouchableOpacity
            onPress={() =>
              setCurrentMonth(new Date(currentYear, currentMonthIdx + 1, 1))
            }
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 24, color: BODY_TEXT, lineHeight: 28 }}>
              ›
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Week Day Headers */}
      <View style={{ flexDirection: "row", marginBottom: 4 }}>
        {WEEK_DAYS.map((d) => (
          <View
            key={d}
            style={{ flex: 1, alignItems: "center", paddingVertical: 6 }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: SECONDARY_TEXT,
                letterSpacing: 0.3,
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Day Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {monthDays.map((item, idx) => {
          if (!item)
            return (
              <View
                key={`e-${idx}`}
                style={{
                  width: `${100 / 7}%` as any,
                  aspectRatio: 1,
                  padding: 3,
                }}
              />
            );
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => !item.isPast && setTempDate(item.date)}
              disabled={item.isPast}
              activeOpacity={0.7}
              style={{
                width: `${100 / 7}%` as any,
                aspectRatio: 1,
                padding: 3,
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  backgroundColor: item.isSelected ? PRIMARY : "transparent",
                  ...(item.isSelected && {
                    shadowColor: PRIMARY,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }),
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: item.isSelected ? "700" : "500",
                    color: item.isSelected
                      ? ON_PRIMARY
                      : item.isPast
                        ? MUTED_TEXT
                        : isSecondary
                          ? SECONDARY_TEXT
                          : BODY_TEXT,
                    opacity: item.isPast ? 0.7 : 1,
                  }}
                >
                  {item.day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

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
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: SURFACE,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "90%",
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: HANDLE,
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
              Select Date
            </Text>
            <TouchableOpacity
              onPress={onClose}
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

          {/* Calendar */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 16,
            }}
          >
            {renderMonth(days, currentYear, currentMonthIdx)}
            <View
              style={{ height: 1, backgroundColor: BORDER, marginVertical: 16 }}
            />
            {renderMonth(nextDays, nextYear, nextMonthIdx, true)}
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
              disabled={!tempDate}
              activeOpacity={0.85}
              style={{
                backgroundColor: PRIMARY,
                opacity: tempDate ? 1 : 0.45,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
                ...(tempDate && {
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
                  color: ON_PRIMARY,
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
