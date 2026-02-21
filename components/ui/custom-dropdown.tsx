import { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { ChevronDown, Check } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";

export interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  className?: string;
  icon?: React.ReactNode;
}

export function CustomDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  className = "",
  icon,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);
  const { primary } = useThemeColors();

  const selectedOption = options.find((o) => o.value === value);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      rotation.value = withSpring(!prev ? 180 : 0, {
        damping: 15,
        stiffness: 200,
      });
      return !prev;
    });
  }, [rotation]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      rotation.value = withTiming(0, { duration: 200 });
    },
    [onChange, rotation]
  );

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className={`z-50 ${className}`}>
      <Text className="mb-1.5 text-sm font-medium text-light-text dark:text-dark-text">
        {label}
      </Text>

      <Pressable
        onPress={toggle}
        className={`flex-row items-center justify-between rounded-xl border-2 bg-light-surface px-4 py-3.5 dark:bg-dark-surface ${
          isOpen
            ? "border-primary"
            : error
              ? "border-red-500"
              : "border-light-border dark:border-dark-border"
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <Text
          className={`flex-1 text-base ${
            selectedOption
              ? "text-light-text dark:text-dark-text"
              : "text-light-text-muted dark:text-dark-text-muted"
          }`}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={isOpen ? primary : "#9CA3AF"} />
        </Animated.View>
      </Pressable>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="mt-1 max-h-52 rounded-xl border-2 border-primary bg-light-surface dark:bg-dark-surface"
          style={{ elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, overflow: "hidden", borderRadius: 12 }}
        >
          <ScrollView bounces={false} nestedScrollEnabled contentContainerStyle={{ padding: 6 }}>
            {options.map((item, index) => (
              <Pressable
                key={item.value}
                onPress={() => handleSelect(item.value)}
                className="flex-row items-center justify-between rounded-lg px-3.5 py-3"
                style={[
                  item.value === value ? { backgroundColor: hexToRgba(primary, 0.15) } : undefined,
                  index > 0 ? { marginTop: 2 } : undefined,
                ]}
              >
                <Text
                  className={`text-base ${
                    item.value === value
                      ? "font-semibold text-primary"
                      : "text-light-text dark:text-dark-text"
                  }`}
                >
                  {item.label}
                </Text>
                {item.value === value && (
                  <Check size={18} color={primary} />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {error && (
        <Text className="mt-1 text-xs text-red-500">{error}</Text>
      )}
    </View>
  );
}
