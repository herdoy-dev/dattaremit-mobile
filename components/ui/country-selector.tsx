import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CountryPickerModal } from "@/components/ui/country-picker-modal";
import { COUNTRIES, getFlagEmoji } from "@/lib/countries";

interface CountrySelectorProps {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  error?: string | null;
  className?: string;
}

export function CountrySelector({
  label,
  value,
  onChange,
  placeholder = "Select a country",
  error,
  className = "",
}: CountrySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { primary, border } = useThemeColors();

  const selectedCountry = COUNTRIES.find((c) => c.code === value);

  return (
    <View className={className}>
      <Text className="mb-1.5 text-sm font-medium text-light-text dark:text-dark-text">
        {label}
      </Text>

      <Pressable
        onPress={() => setModalVisible(true)}
        className="flex-row items-center rounded-xl border-2 bg-light-surface px-4 py-3.5 dark:bg-dark-surface"
        style={{ borderColor: error ? "#EF4444" : value ? primary : border }}
      >
        {selectedCountry ? (
          <>
            <Text style={{ fontSize: 20, marginRight: 10 }}>
              {getFlagEmoji(selectedCountry.code)}
            </Text>
            <Text className="flex-1 text-base text-light-text dark:text-dark-text">
              {selectedCountry.name}
            </Text>
          </>
        ) : (
          <Text className="flex-1 text-base text-light-text-muted dark:text-dark-text-muted">
            {placeholder}
          </Text>
        )}
        <ChevronDown size={20} color="#9CA3AF" />
      </Pressable>

      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}

      <CountryPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(country) => onChange(country.code)}
        selectedCode={value}
      />
    </View>
  );
}
