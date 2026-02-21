import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { Calendar } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";
import { CustomModal } from "@/components/ui/custom-modal";

interface CustomDatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  error?: string | null;
  className?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5;

const MONTHS_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

const currentYear = new Date().getFullYear();
const YEARS: number[] = [];
for (let y = currentYear; y >= currentYear - 100; y--) YEARS.push(y);

// Pad data with 2 empty items top/bottom for scroll overflow
function padData(items: string[]): string[] {
  return ["", "", ...items, "", ""];
}

function getOpacity(index: number, selectedIndex: number): number {
  const dist = Math.abs(index - selectedIndex);
  if (dist === 0) return 1;
  if (dist === 1) return 0.4;
  if (dist === 2) return 0.2;
  return 0.1;
}

function PickerColumn({
  items,
  selectedIndex,
  onSelect,
  flex,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  flex: number;
}) {
  const listRef = useRef<FlatList>(null);
  const { primary } = useThemeColors();
  const paddedItems = useMemo(() => padData(items), [items]);
  // Padded index = real index + 2 (for the 2 empty items at top)
  const paddedSelectedIndex = selectedIndex + 2;

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: paddedSelectedIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [paddedSelectedIndex, items.length]);

  const handleMomentumScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const rawIndex = Math.round(y / ITEM_HEIGHT);
      // Subtract 2 for padding items
      const realIndex = rawIndex;
      const clamped = Math.max(0, Math.min(realIndex, items.length - 1));
      onSelect(clamped);
    },
    [items.length, onSelect]
  );

  return (
    <View style={{ flex, height: VISIBLE_COUNT * ITEM_HEIGHT, overflow: "hidden" }}>
      {/* Selection highlight */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: ((VISIBLE_COUNT - 1) / 2) * ITEM_HEIGHT,
          left: 4,
          right: 4,
          height: ITEM_HEIGHT,
          borderRadius: 10,
          backgroundColor: hexToRgba(primary, 0.15),
          zIndex: 1,
        }}
      />
      <FlatList
        ref={listRef}
        data={paddedItems}
        keyExtractor={(item, i) => `${item}-${i}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialScrollIndex={Math.max(0, paddedSelectedIndex - 2)}
        renderItem={({ item, index }) => {
          const opacity = item ? getOpacity(index, paddedSelectedIndex) : 0;
          return (
            <View
              style={{
                height: ITEM_HEIGHT,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ opacity }}
                className={
                  index === paddedSelectedIndex
                    ? "text-base font-bold text-primary"
                    : "text-base font-normal text-light-text dark:text-dark-text"
                }
              >
                {item}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

export function CustomDatePicker({
  label,
  value,
  onChange,
  error,
  className = "",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { primary, border } = useThemeColors();

  const today = new Date();
  const parsed = value ? new Date(value) : null;

  const defaultDay = parsed?.getDate() ?? today.getDate();
  const defaultMonth = parsed?.getMonth() ?? today.getMonth();
  const defaultYear = parsed?.getFullYear() ?? today.getFullYear() - 25;

  // Committed state (tracks the value prop)
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  // Temp state for the modal
  const [tempDay, setTempDay] = useState(defaultDay);
  const [tempMonth, setTempMonth] = useState(defaultMonth);
  const [tempYear, setTempYear] = useState(defaultYear);

  const maxDay = getDaysInMonth(tempMonth, tempYear);
  const days = useMemo(() => {
    const result: string[] = [];
    for (let d = 1; d <= maxDay; d++) result.push(String(d));
    return result;
  }, [maxDay]);

  // Clamp day when month/year changes
  useEffect(() => {
    if (tempDay > maxDay) setTempDay(maxDay);
  }, [maxDay, tempDay]);

  const formatDisplay = () => {
    if (!value) return "";
    const d = new Date(value);
    return `${MONTHS_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const handleOpen = () => {
    // Initialize temp state from committed state
    setTempDay(selectedDay);
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    setIsOpen(true);
  };

  const handleDone = () => {
    const day = Math.min(tempDay, maxDay);
    const date = new Date(tempYear, tempMonth, day);
    setSelectedDay(day);
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    onChange(date.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const yearIndex = YEARS.indexOf(tempYear);

  return (
    <View className={className}>
      <Text className="mb-1.5 text-sm font-medium text-light-text dark:text-dark-text">
        {label}
      </Text>

      <Pressable
        onPress={handleOpen}
        className="flex-row items-center rounded-xl border-2 bg-light-surface px-4 py-3.5 dark:bg-dark-surface"
        style={{ borderColor: error ? "#EF4444" : value ? primary : border }}
      >
        <Calendar size={20} color={value ? primary : "#9CA3AF"} />
        <Text
          className={`ml-3 flex-1 text-base ${
            value
              ? "text-light-text dark:text-dark-text"
              : "text-light-text-muted dark:text-dark-text-muted"
          }`}
        >
          {formatDisplay() || "Select date"}
        </Text>
      </Pressable>

      <CustomModal visible={isOpen} onClose={handleCancel} snapPoint={0.45}>
        {/* Cancel / Title / Done header */}
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Text className="text-base text-light-text-muted dark:text-dark-text-muted">
              Cancel
            </Text>
          </Pressable>
          <Text className="text-base font-semibold text-light-text dark:text-dark-text">
            Date of Birth
          </Text>
          <Pressable onPress={handleDone} hitSlop={8}>
            <Text className="text-base font-semibold text-primary">Done</Text>
          </Pressable>
        </View>

        {/* Picker columns: Month, Day, Year */}
        <View className="flex-row">
          <PickerColumn
            items={MONTHS_FULL}
            selectedIndex={tempMonth}
            onSelect={setTempMonth}
            flex={2}
          />
          <PickerColumn
            items={days}
            selectedIndex={tempDay - 1}
            onSelect={(i) => setTempDay(i + 1)}
            flex={1}
          />
          <PickerColumn
            items={YEARS.map(String)}
            selectedIndex={yearIndex >= 0 ? yearIndex : 0}
            onSelect={(i) => setTempYear(YEARS[i])}
            flex={1.2}
          />
        </View>
      </CustomModal>

      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
