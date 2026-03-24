import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { COLORS } from "@/constants/theme";
import { FieldLabel } from "@/components/ui/field-label";
import { FieldError } from "@/components/ui/field-error";
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
  const { primary, border, surface } = useThemeColors();

  const selectedCountry = COUNTRIES.find((c) => c.code === value);

  return (
    <View className={className}>
      <FieldLabel label={label} />

      <Pressable
        onPress={() => setModalVisible(true)}
        className="flex-row items-center rounded-xl border-2 px-4 py-3.5"
        style={{
          borderColor: error ? COLORS.error : value ? primary : border,
          backgroundColor: surface,
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selectedCountry?.name || "not selected"}`}
        accessibilityHint="Opens country picker"
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
        <ChevronDown size={20} color={COLORS.placeholder} />
      </Pressable>

      <FieldError error={error} />

      <CountryPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(country) => onChange(country.code)}
        selectedCode={value}
      />
    </View>
  );
}
