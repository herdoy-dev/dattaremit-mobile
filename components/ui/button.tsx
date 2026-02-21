import { Pressable, Text, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/use-theme-colors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "",
  secondary: "bg-light-surface-dark dark:bg-dark-surface-light",
  outline: "border-2 bg-transparent",
  ghost: "bg-transparent",
  danger: "bg-red-500",
};

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-light-text dark:text-dark-text",
  outline: "",
  ghost: "",
  danger: "text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-5",
  md: "h-12 px-6",
  lg: "h-14 px-8",
};

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

function getVariantInlineStyle(variant: ButtonVariant, primary: string): ViewStyle {
  switch (variant) {
    case "primary": return { backgroundColor: primary };
    case "outline": return { borderColor: primary };
    default: return {};
  }
}

function getTextInlineStyle(variant: ButtonVariant, primary: string): TextStyle | undefined {
  switch (variant) {
    case "outline":
    case "ghost": return { color: primary };
    default: return undefined;
  }
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  className = "",
}: ButtonProps) {
  const scale = useSharedValue(1);
  const { primary } = useThemeColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      disabled={disabled || loading}
      style={[animatedStyle, getVariantInlineStyle(variant, primary)]}
      className={`flex-row items-center justify-center rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#fff" : primary}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          {title && (
            <Text
              className={`font-semibold ${variantTextStyles[variant]} ${sizeTextStyles[size]} ${icon ? "ml-2" : ""}`}
              style={getTextInlineStyle(variant, primary)}
            >
              {title}
            </Text>
          )}
        </>
      )}
    </AnimatedPressable>
  );
}
