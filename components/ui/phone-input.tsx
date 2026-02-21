import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { ChevronDown } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CountryPickerModal } from "@/components/ui/country-picker-modal";
import { type Country, COUNTRIES, getFlagEmoji } from "@/lib/countries";

interface PhoneInputProps {
  label: string;
  value: string;
  onChangePhone: (fullPhone: string) => void;
  placeholder?: string;
  error?: string | null;
  defaultCountryCode?: string;
  className?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

// Sort dial codes longest-first so "+880" matches before "+8"
const dialCodesSorted = [...COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length
);

export function PhoneInput({
  label,
  value,
  onChangePhone,
  placeholder = "Enter phone number",
  error,
  defaultCountryCode = "GB",
  className = "",
}: PhoneInputProps) {
  const { primary, border, borderFocus } = useThemeColors();
  const [pickerVisible, setPickerVisible] = useState(false);
  const focusProgress = useSharedValue(0);

  const { selectedCountry, localNumber } = useMemo(() => {
    const trimmed = value.trim();

    for (const country of dialCodesSorted) {
      if (trimmed.startsWith(country.dial)) {
        const rest = trimmed.slice(country.dial.length).trimStart();
        return { selectedCountry: country, localNumber: rest };
      }
    }

    const fallback =
      COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
    return { selectedCountry: fallback, localNumber: trimmed };
  }, [value, defaultCountryCode]);

  const handleCountrySelect = (country: Country) => {
    onChangePhone(
      localNumber ? `${country.dial}${localNumber}` : country.dial
    );
  };

  const handleTextChange = (text: string) => {
    onChangePhone(
      text ? `${selectedCountry.dial}${text}` : selectedCountry.dial
    );
  };

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? "#EF4444"
      : interpolateColor(focusProgress.value, [0, 1], [border, borderFocus]),
  }));

  return (
    <View className={className}>
      <Text className="mb-1.5 text-sm font-medium text-light-text dark:text-dark-text">
        {label}
      </Text>

      <AnimatedView
        style={borderStyle}
        className="flex-row items-center rounded-xl border-2 bg-light-surface dark:bg-dark-surface"
      >
        {/* Country selector */}
        <Pressable
          onPress={() => setPickerVisible(true)}
          className="flex-row items-center px-4 py-3.5"
        >
          <Text style={{ fontSize: 20 }}>
            {getFlagEmoji(selectedCountry.code)}
          </Text>
          <Text className="ml-1.5 text-base text-light-text dark:text-dark-text">
            {selectedCountry.dial}
          </Text>
          <ChevronDown size={16} color="#9CA3AF" className="ml-1" />
        </Pressable>

        {/* Divider */}
        <View style={{ width: 1, height: 24, backgroundColor: border }} />

        {/* Phone number input */}
        <TextInput
          className="flex-1 px-3 py-3.5 text-base text-light-text dark:text-dark-text"
          value={localNumber}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          onFocus={() => {
            focusProgress.value = withTiming(1, { duration: 200 });
          }}
          onBlur={() => {
            focusProgress.value = withTiming(0, { duration: 200 });
          }}
        />
      </AnimatedView>

      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}

      <CountryPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleCountrySelect}
        selectedCode={selectedCountry.code}
      />
    </View>
  );
}
