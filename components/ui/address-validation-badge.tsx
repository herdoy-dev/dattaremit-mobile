import { View, Text, Pressable, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { COLORS } from "@/constants/theme";
import type { ValidationStatus } from "@/types/address";

interface AddressValidationBadgeProps {
  status: ValidationStatus;
  isValidating?: boolean;
  corrections?: { field: string; original: string; corrected: string }[];
  formattedAddress?: string;
  onAcceptCorrections?: () => void;
  className?: string;
}

const STATUS_CONFIG = {
  VALID: {
    icon: CheckCircle,
    label: "Address verified",
    containerClass: "rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20",
    textClass: "text-sm text-emerald-600 dark:text-emerald-400",
    iconColor: "#059669",
  },
  NEEDS_REVIEW: {
    icon: AlertTriangle,
    label: "Review suggested changes",
    containerClass: "rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20",
    textClass: "text-sm text-amber-600 dark:text-amber-400",
    iconColor: "#D97706",
  },
  INVALID: {
    icon: XCircle,
    label: "Address could not be verified",
    containerClass: "rounded-xl bg-red-50 p-3 dark:bg-red-900/20",
    textClass: "text-sm text-red-600 dark:text-red-400",
    iconColor: "#EF4444",
  },
  UNAVAILABLE: {
    icon: HelpCircle,
    label: "Validation unavailable",
    containerClass: "rounded-xl bg-gray-50 p-3 dark:bg-gray-900/20",
    textClass: "text-sm text-gray-500 dark:text-gray-400",
    iconColor: "#9CA3AF",
  },
} as const;

export function AddressValidationBadge({
  status,
  isValidating = false,
  corrections,
  formattedAddress,
  onAcceptCorrections,
  className = "",
}: AddressValidationBadgeProps) {
  const { primary } = useThemeColors();

  if (isValidating) {
    return (
      <Animated.View
        entering={FadeInDown.duration(300).springify()}
        className={`flex-row items-center rounded-xl bg-gray-50 p-3 dark:bg-gray-900/20 ${className}`}
        accessibilityRole="alert"
      >
        <ActivityIndicator size="small" color={COLORS.muted} />
        <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">Validating address...</Text>
      </Animated.View>
    );
  }

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()} className={className}>
      <View className={config.containerClass} accessibilityRole="alert">
        <View className="flex-row items-center gap-2">
          <Icon size={18} color={config.iconColor} />
          <Text className={config.textClass}>{config.label}</Text>
        </View>
      </View>

      {status === "VALID" && formattedAddress && (
        <Text className="mt-1.5 text-xs text-light-text-muted dark:text-dark-text-muted">
          {formattedAddress}
        </Text>
      )}

      {status === "NEEDS_REVIEW" && corrections && corrections.length > 0 && (
        <View className="mt-2 gap-1.5">
          {corrections.map((correction, index) => (
            <View key={index} className="flex-row items-center gap-2">
              <Text className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted">
                {correction.field}:
              </Text>
              <Text
                className="text-sm text-light-text-muted dark:text-dark-text-muted"
                style={{ textDecorationLine: "line-through" }}
              >
                {correction.original}
              </Text>
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                {correction.corrected}
              </Text>
            </View>
          ))}

          {onAcceptCorrections && (
            <Pressable onPress={onAcceptCorrections} className="mt-1">
              <Text className="text-sm font-semibold" style={{ color: primary }}>
                Accept corrections
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}
