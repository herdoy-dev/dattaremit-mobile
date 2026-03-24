import { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { MapPin, X } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { COLORS } from "@/constants/theme";
import { FieldLabel } from "@/components/ui/field-label";
import { FieldError } from "@/components/ui/field-error";
import type { AutocompletePrediction } from "@/types/address";

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suggestions: AutocompletePrediction[];
  onSelect: (prediction: AutocompletePrediction) => void;
  isLoading?: boolean;
  placeholder?: string;
  emptyText?: string;
  error?: string | null;
  icon?: React.ReactNode;
  className?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function AddressAutocomplete({
  label,
  value,
  onChangeText,
  suggestions,
  onSelect,
  isLoading = false,
  placeholder = "Search for an address",
  emptyText = "No results found",
  error,
  icon,
  className = "",
}: AddressAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);
  const selectingRef = useRef(false);
  const { primary, border, borderFocus } = useThemeColors();

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? COLORS.error
      : interpolateColor(focusProgress.value, [0, 1], [border, borderFocus]),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 200 });
    // Delay closing to allow onSelect to fire first
    setTimeout(() => {
      if (!selectingRef.current) {
        setIsFocused(false);
      }
      selectingRef.current = false;
    }, 150);
  };

  const handleSelect = (prediction: AutocompletePrediction) => {
    selectingRef.current = false;
    setIsFocused(false);
    onSelect(prediction);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChangeText("");
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && (suggestions.length > 0 || isLoading || value.length >= 3);

  return (
    <View className={`z-50 ${className}`}>
      <FieldLabel label={label} />

      <AnimatedView
        style={borderStyle}
        className="flex-row items-center rounded-xl border-2 bg-light-surface px-4 dark:bg-dark-surface"
      >
        <View className="mr-3">{icon || <MapPin size={20} color={COLORS.placeholder} />}</View>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          autoCapitalize="words"
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-1 py-3.5 text-base text-light-text dark:text-dark-text"
          accessibilityRole="search"
          accessibilityLabel={label}
        />

        {isLoading && value.length > 0 ? (
          <ActivityIndicator size="small" color={COLORS.placeholder} />
        ) : value.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            <X size={18} color={COLORS.placeholder} />
          </Pressable>
        ) : null}
      </AnimatedView>

      {showDropdown && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="mt-1 max-h-52 overflow-hidden rounded-xl border bg-light-surface dark:bg-dark-surface"
          style={{ borderColor: primary }}
        >
          <ScrollView
            bounces={false}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {isLoading && suggestions.length === 0 ? (
              <View className="flex-row items-center justify-center px-3.5 py-3">
                <ActivityIndicator size="small" color={COLORS.muted} />
                <Text className="ml-2 text-sm text-light-text-muted dark:text-dark-text-muted">
                  Searching...
                </Text>
              </View>
            ) : suggestions.length === 0 ? (
              <View className="px-3.5 py-3">
                <Text className="text-sm text-light-text-muted dark:text-dark-text-muted">
                  {emptyText}
                </Text>
              </View>
            ) : (
              suggestions.map((item, index) => (
                <Pressable
                  key={item.placeId}
                  onPressIn={() => {
                    selectingRef.current = true;
                  }}
                  onPress={() => handleSelect(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item.description}
                  className="flex-row items-center px-4 py-3"
                >
                  <MapPin size={16} color={COLORS.placeholder} />
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-base font-medium text-light-text dark:text-dark-text"
                      numberOfLines={1}
                    >
                      {item.mainText}
                    </Text>
                    <Text
                      className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted"
                      numberOfLines={1}
                    >
                      {item.secondaryText}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      <FieldError error={error} />
    </View>
  );
}
