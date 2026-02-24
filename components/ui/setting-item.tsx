import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/lib/utils";
import { COLORS } from "@/constants/theme";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

export function SettingItem({
  icon,
  label,
  value,
  onPress,
  rightElement,
  danger,
}: SettingItemProps) {
  const { primary } = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3.5"
      accessibilityRole="button"
      accessibilityLabel={`${label}${value ? `, ${value}` : ""}`}
      accessibilityState={{ disabled: !onPress }}
    >
      <View
        className={`mr-3.5 h-10 w-10 items-center justify-center rounded-xl ${danger ? "bg-red-100 dark:bg-red-900/30" : ""}`}
        style={
          !danger ? { backgroundColor: hexToRgba(primary, 0.1) } : undefined
        }
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={`text-sm font-medium ${danger ? "text-red-500" : "text-light-text dark:text-dark-text"}`}
        >
          {label}
        </Text>
        {value && (
          <Text className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted">
            {value}
          </Text>
        )}
      </View>
      {rightElement ||
        (onPress && <ChevronRight size={18} color={COLORS.placeholder} />)}
    </Pressable>
  );
}
