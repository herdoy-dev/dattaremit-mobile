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
import { hexToRgba } from "@/lib/utils";
import { COLORS } from "@/constants/theme";
import { FieldLabel } from "@/components/ui/field-label";
import { FieldError } from "@/components/ui/field-error";

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
  const { primary, border, surface } = useThemeColors();

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
    [onChange, rotation],
  );

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className={`z-50 ${className}`}>
      <FieldLabel label={label} />

      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between rounded-xl border-2 px-4 py-3.5"
        style={{
          borderColor: error ? COLORS.error : isOpen ? primary : value ? primary : border,
          backgroundColor: surface,
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${selectedOption?.label || "not selected"}`}
        accessibilityState={{ expanded: isOpen }}
        accessibilityHint="Opens dropdown menu"
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
          <ChevronDown
            size={20}
            color={error ? COLORS.error : isOpen ? primary : COLORS.placeholder}
          />
        </Animated.View>
      </Pressable>

      {isOpen && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="mt-1 max-h-52 rounded-xl border-2"
          style={{
            borderColor: primary,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            overflow: "hidden",
            borderRadius: 12,
            backgroundColor: surface,
          }}
        >
          <ScrollView bounces={false} nestedScrollEnabled contentContainerStyle={{ padding: 6 }}>
            {options.map((item, index) => (
              <Pressable
                key={item.value}
                onPress={() => handleSelect(item.value)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: item.value === value }}
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
                {item.value === value && <Check size={18} color={primary} />}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <FieldError error={error} />
    </View>
  );
}
