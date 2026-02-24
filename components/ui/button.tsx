import { Pressable, Text, ActivityIndicator, type ViewStyle, type TextStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { usePressAnimation } from "@/hooks/use-press-animation";

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
  const { primary } = useThemeColors();
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={[animatedStyle, getVariantInlineStyle(variant, primary)]}
      className={`flex-row items-center justify-center rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50" : ""} ${className}`}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
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
