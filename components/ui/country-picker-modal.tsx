import { useMemo, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { X, Search } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { COLORS } from "@/constants/theme";
import { buildThemeVars } from "@/store/theme-store";
import { hexToRgba } from "@/lib/utils";
import { type Country, COUNTRIES, getFlagEmoji } from "@/lib/countries";

interface CountryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCode?: string;
}

export function CountryPickerModal({
  visible,
  onClose,
  onSelect,
  selectedCode,
}: CountryPickerModalProps) {
  const [search, setSearch] = useState("");
  const { primary, surface, border, rawColors } = useThemeColors();
  const themeVars = buildThemeVars(rawColors);

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dial.includes(q)
    );
  }, [search]);

  const handleSelect = (country: Country) => {
    onSelect(country);
    onClose();
    setSearch("");
  };

  const handleClose = () => {
    onClose();
    setSearch("");
  };

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}
    >
      <View style={[{ flex: 1, backgroundColor: surface }, themeVars]}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between border-b border-light-border px-5 pb-4 pt-5 dark:border-dark-border"
        >
          <Text className="text-lg font-bold text-light-text dark:text-dark-text">
            Select Country
          </Text>
          <Pressable onPress={handleClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
            <X size={24} className="text-light-text-muted dark:text-dark-text-muted" />
          </Pressable>
        </View>

        {/* Search bar */}
        <View className="px-5 py-3">
          <View
            className="flex-row items-center rounded-xl border-2 border-light-border bg-light-surface px-3.5 dark:border-dark-border dark:bg-dark-surface"
          >
            <Search size={18} color={COLORS.placeholder} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search country..."
              placeholderTextColor={COLORS.placeholder}
              autoCorrect={false}
              accessibilityLabel="Search countries"
              className="ml-2.5 flex-1 py-3 text-base text-light-text dark:text-dark-text"
            />
          </View>
        </View>

        {/* Country list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => (
            <View
              style={{ height: 1, backgroundColor: border, marginLeft: 56 }}
            />
          )}
          renderItem={({ item }) => {
            const isSelected = item.code === selectedCode;
            return (
              <Pressable
                onPress={() => handleSelect(item)}
                className="flex-row items-center px-5 py-3.5"
                style={
                  isSelected
                    ? { backgroundColor: hexToRgba(primary, 0.1) }
                    : undefined
                }
                accessibilityRole="button"
                accessibilityLabel={`${item.name} ${item.dial}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={{ fontSize: 24, width: 36 }}>
                  {getFlagEmoji(item.code)}
                </Text>
                <Text
                  className={`flex-1 text-base ${
                    isSelected
                      ? "font-semibold text-primary"
                      : "text-light-text dark:text-dark-text"
                  }`}
                >
                  {item.name}
                </Text>
                <Text className="text-sm text-light-text-muted dark:text-dark-text-muted">
                  {item.dial}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-sm text-light-text-muted dark:text-dark-text-muted">
                No countries found
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}
