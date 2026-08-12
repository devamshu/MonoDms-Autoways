import NepaliDate from "nepali-date-converter";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

// ─── Nepali Calendar Data ────────────────────────────────────────────────────

const BS_MONTHS = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

// Days in each month for BS years (cached for performance)
const BS_YEAR_MONTH_DAYS_CACHE: Record<number, number[]> = {};

// Get days in month using NepaliDate library
function getDaysInMonth(year: number, monthIndex: number): number {
  // Check cache first
  if (BS_YEAR_MONTH_DAYS_CACHE[year]?.[monthIndex]) {
    return BS_YEAR_MONTH_DAYS_CACHE[year][monthIndex];
  }

  // Calculate using NepaliDate
  try {
    // Create date for the first day of the month
    const date = new NepaliDate(year, monthIndex, 1);
    // Get the last day of the month by trying different days
    for (let day = 32; day >= 28; day--) {
      try {
        const testDate = new NepaliDate(year, monthIndex, day);
        if (testDate.getDate() === day && testDate.getMonth() === monthIndex) {
          // Initialize cache for this year if needed
          if (!BS_YEAR_MONTH_DAYS_CACHE[year]) {
            BS_YEAR_MONTH_DAYS_CACHE[year] = new Array(12).fill(0);
          }
          BS_YEAR_MONTH_DAYS_CACHE[year][monthIndex] = day;
          return day;
        }
      } catch (e) {
        // Day doesn't exist, continue
        continue;
      }
    }
  } catch (e) {
    console.error("Error getting days in month:", e);
  }

  // Default fallback
  return 30;
}

// Pre-calculate days for a year
function preCalculateYearDays(year: number): number[] {
  const days: number[] = [];
  for (let month = 0; month < 12; month++) {
    days.push(getDaysInMonth(year, month));
  }
  BS_YEAR_MONTH_DAYS_CACHE[year] = days;
  return days;
}

// Get current Nepali date using the library
function getCurrentNepaliDate(): BSDate {
  const today = new NepaliDate();
  return {
    year: today.getYear(),
    month: today.getMonth() + 1, // NepaliDate returns 0-indexed month
    day: today.getDate(),
  };
}

// Get dynamic year range (past 20 years up to current)
function getDynamicYearRange(maxYearsBack: number = 20): number[] {
  const currentYear = getCurrentNepaliDate().year;
  const startYear = currentYear - maxYearsBack;
  const years: number[] = [];

  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
    // Pre-calculate days for this year for better performance
    preCalculateYearDays(year);
  }
  return years;
}

// Get current fiscal year (runs from Shrawan month 4 to Ashadh month 3 of next year)
function getCurrentFiscalYear(): number {
  const currentDate = getCurrentNepaliDate();
  // If current month is before Shrawan (months 1-3: Baishakh, Jestha, Ashadh)
  if (currentDate.month < 4) {
    return currentDate.year - 1;
  }
  return currentDate.year;
}

// Get months for fiscal year (Shrawan to Ashadh)
function getFiscalYearMonths(): string[] {
  return [...BS_MONTHS.slice(3), ...BS_MONTHS.slice(0, 3)];
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BSDate {
  year: number;
  month: number; // 1-indexed
  day: number;
}

interface NepaliDatePickerProps {
  visible: boolean;
  initialDate?: BSDate;
  onSave: (date: BSDate) => void;
  onCancel: () => void;
  title?: string;
  accentColor?: string;
  accentTextColor?: string;
  maxYearsBack?: number; // How many years back to show (default: 20)
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── ScrollPicker ────────────────────────────────────────────────────────────

interface ScrollPickerProps {
  data: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  flex?: number;
  enabled?: boolean;
}

const ScrollPicker: React.FC<ScrollPickerProps> = ({
  data,
  selectedIndex,
  onIndexChange,
  flex = 1,
  enabled = true,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const paddedData = ["", "", ...data, "", ""];

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const validIndex = Math.max(0, Math.min(index, data.length - 1));
      flatListRef.current?.scrollToOffset({
        offset: validIndex * ITEM_HEIGHT,
        animated,
      });
    },
    [data.length],
  );

  useEffect(() => {
    if (enabled && selectedIndex >= 0 && selectedIndex < data.length) {
      const timer = setTimeout(() => scrollToIndex(selectedIndex, false), 50);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex, scrollToIndex, enabled, data.length]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!enabled || viewableItems.length === 0) return;

      const middleItem = viewableItems[Math.floor(viewableItems.length / 2)];
      if (middleItem?.index != null) {
        const dataIndex = middleItem.index - 2;
        if (dataIndex >= 0 && dataIndex < data.length) {
          onIndexChange(dataIndex);
        }
      }
    },
  ).current;

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const dataIndex = index - 2;
    const isSelected = dataIndex === selectedIndex;
    const isAdjacent = Math.abs(dataIndex - selectedIndex) === 1;
    const isEmpty = item === "";

    return (
      <TouchableOpacity
        style={styles.pickerItem}
        onPress={() => {
          if (!enabled) return;
          if (dataIndex >= 0 && dataIndex < data.length) {
            onIndexChange(dataIndex);
            scrollToIndex(dataIndex);
          }
        }}
        activeOpacity={enabled ? 0.7 : 1}
      >
        <Text
          style={[
            styles.pickerItemText,
            isSelected && [styles.selectedText, { color: "#1a1a2e" }],
            isAdjacent && styles.adjacentText,
            !isSelected && !isAdjacent && isEmpty && { opacity: 0 },
            !enabled && styles.disabledText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.pickerColumn, { flex, opacity: enabled ? 1 : 0.5 }]}>
      <FlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        bounces={false}
        scrollEnabled={enabled}
      />
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
  visible,
  initialDate,
  onSave,
  onCancel,
  title = "Enter Purchase Date",
  accentColor = "#ffffff",
  accentTextColor = "#ffffff",
  maxYearsBack = 20,
}) => {
  const currentDate = getCurrentNepaliDate();
  const currentFiscalYear = getCurrentFiscalYear();
  const availableYears = getDynamicYearRange(maxYearsBack);

  const init = initialDate || currentDate;

  // Find initial indices
  const findYearIndex = () => {
    const index = availableYears.indexOf(init.year);
    return index >= 0 ? index : availableYears.length - 1;
  };

  const [yearIndex, setYearIndex] = useState(findYearIndex());
  const [monthIndex, setMonthIndex] = useState(() => {
    const selectedYear = availableYears[yearIndex];
    const isFiscalYear = selectedYear === currentFiscalYear;
    let month = Math.min(11, Math.max(0, init.month - 1));

    if (isFiscalYear) {
      // For fiscal year, months are reordered
      const fiscalMonths = getFiscalYearMonths();
      const currentMonthName = BS_MONTHS[init.month - 1];
      month = fiscalMonths.indexOf(currentMonthName);
      if (month === -1) month = 0;
    }
    return month;
  });

  const [dayIndex, setDayIndex] = useState(() => {
    const selectedYear = availableYears[yearIndex];
    let actualMonthIndex = monthIndex;

    if (selectedYear === currentFiscalYear) {
      const fiscalMonths = getFiscalYearMonths();
      const monthName = fiscalMonths[monthIndex];
      actualMonthIndex = BS_MONTHS.indexOf(monthName);
    }

    const daysInMonth = getDaysInMonth(selectedYear, actualMonthIndex);
    return Math.min(init.day - 1, daysInMonth - 1);
  });

  const selectedYear = availableYears[yearIndex];
  const isCurrentFiscalYearSelected = selectedYear === currentFiscalYear;

  // Get available months based on selected year
  const availableMonths = isCurrentFiscalYearSelected
    ? getFiscalYearMonths()
    : BS_MONTHS;

  // Get days array based on selected year and month
  const getCurrentDaysArray = () => {
    let actualMonthIndex = monthIndex;

    if (isCurrentFiscalYearSelected) {
      const monthName = availableMonths[monthIndex];
      actualMonthIndex = BS_MONTHS.indexOf(monthName);
    }

    const daysCount = getDaysInMonth(selectedYear, actualMonthIndex);
    return Array.from({ length: daysCount }, (_, i) =>
      String(i + 1).padStart(2, "0"),
    );
  };

  const days = getCurrentDaysArray();

  // Update days when year or month changes
  useEffect(() => {
    if (dayIndex >= days.length) {
      setDayIndex(Math.max(0, days.length - 1));
    }
  }, [days.length, dayIndex]);

  // Update month display when year changes
  useEffect(() => {
    const newIsFiscalYear = selectedYear === currentFiscalYear;
    if (newIsFiscalYear !== isCurrentFiscalYearSelected) {
      // Reset to first month when switching between fiscal and normal years
      setMonthIndex(0);
    }
  }, [selectedYear]);

  // Reset when picker opens
  useEffect(() => {
    if (visible) {
      const yearIdx = findYearIndex();
      setYearIndex(yearIdx);

      const newSelectedYear = availableYears[yearIdx];
      const isFiscal = newSelectedYear === currentFiscalYear;

      let month = Math.min(11, Math.max(0, init.month - 1));
      if (isFiscal) {
        const fiscalMonths = getFiscalYearMonths();
        const currentMonthName = BS_MONTHS[init.month - 1];
        month = fiscalMonths.indexOf(currentMonthName);
        if (month === -1) month = 0;
      }
      setMonthIndex(month);

      let actualMonthIndex = month;
      if (isFiscal) {
        const monthName = getFiscalYearMonths()[month];
        actualMonthIndex = BS_MONTHS.indexOf(monthName);
      }

      const daysInMonth = getDaysInMonth(newSelectedYear, actualMonthIndex);
      const day = Math.min(init.day - 1, daysInMonth - 1);
      setDayIndex(Math.max(0, day));
    }
  }, [visible]);

  const handleSave = () => {
    let actualMonth = monthIndex;
    let actualMonthName = "";

    if (isCurrentFiscalYearSelected) {
      actualMonthName = availableMonths[monthIndex];
      actualMonth = BS_MONTHS.indexOf(actualMonthName);
    } else {
      actualMonthName = BS_MONTHS[monthIndex];
      actualMonth = monthIndex;
    }

    onSave({
      year: selectedYear,
      month: actualMonth + 1,
      day: dayIndex + 1,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onCancel}
      >
        <TouchableOpacity activeOpacity={1}>
          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.selectionRow}>
                <View
                  style={[
                    styles.selectionBorderSegment,
                    { borderColor: "#E0E7EB" },
                  ]}
                />
                <View
                  style={[
                    styles.selectionBorderSegment,
                    { borderColor: "#E0E7EB" },
                  ]}
                />
                <View
                  style={[
                    styles.selectionBorderSegment,
                    { borderColor: "#E0E7EB" },
                  ]}
                />
              </View>

              <ScrollPicker
                data={availableYears.map(String)}
                selectedIndex={yearIndex}
                onIndexChange={setYearIndex}
                flex={1.1}
              />

              <ScrollPicker
                data={availableMonths}
                selectedIndex={monthIndex}
                onIndexChange={setMonthIndex}
                flex={1.4}
              />

              <ScrollPicker
                data={days}
                selectedIndex={dayIndex}
                onIndexChange={setDayIndex}
                flex={0.9}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: accentColor }]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={[styles.saveText, { color: accentTextColor }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 48, 360),
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "left",
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  pickerContainer: {
    flexDirection: "row",
    height: PICKER_HEIGHT,
    position: "relative",
    overflow: "hidden",
  },
  pickerColumn: {
    height: PICKER_HEIGHT,
    overflow: "hidden",
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 15,
    color: "#b0b0c0",
    fontWeight: "400",
  },
  selectedText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  adjacentText: {
    fontSize: 15,
    color: "#888899",
    fontWeight: "500",
  },
  disabledText: {
    opacity: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888899",
  },
  saveButton: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  selectionRow: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    flexDirection: "row",
    zIndex: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  selectionBorderSegment: {
    flex: 1,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderRadius: 10,
  },
});

export default NepaliDatePicker;
