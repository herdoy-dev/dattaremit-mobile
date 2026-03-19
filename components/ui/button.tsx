import { useEffect } from "react";
import { Pressable, Text, View, type ViewStyle, type TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { usePressAnimation } from "@/hooks/use-press-animation";
import { LoadingDots } from "@/components/ui/loading-dots";

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

const dotSizes: Record<ButtonSize, number> = {
  sm: 5,
  md: 6,
  lg: 7,
};

function getVariantInlineStyle(variant: ButtonVariant, primary: string): ViewStyle {
  switch (variant) {
    case "primary":
      return { backgroundColor: primary };
    case "outline":
      return { borderColor: primary };
    default:
      return {};
  }
}

function getTextInlineStyle(variant: ButtonVariant, primary: string): TextStyle | undefined {
  switch (variant) {
    case "outline":
    case "ghost":
      return { color: primary };
    default:
      return undefined;
  }
}

function getLoadingColor(variant: ButtonVariant, primary: string): string {
  if (variant === "primary" || variant === "danger") return "#fff";
  return primary;
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
  const shimmerOpacity = useSharedValue(1);

  useEffect(() => {
    shimmerOpacity.value = loading
      ? withTiming(0.85, { duration: 200, easing: Easing.out(Easing.ease) })
      : withSpring(1, { damping: 15, stiffness: 200 });
  }, [loading, shimmerOpacity]);

  const containerOpacityStyle = useAnimatedStyle(() => ({
    opacity: shimmerOpacity.value,
  }));

  const loadingColor = getLoadingColor(variant, primary);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      style={[animatedStyle, containerOpacityStyle, getVariantInlineStyle(variant, primary)]}
      className={`flex-row items-center justify-center overflow-hidden rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${disabled && !loading ? "opacity-50" : ""} ${className}`}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(150)}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <LoadingDots color={loadingColor} size={dotSizes[size]} />
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(100)}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          {icon && <View>{icon}</View>}
          {title && (
            <Text
              className={`font-semibold ${variantTextStyles[variant]} ${sizeTextStyles[size]} ${icon ? "ml-2" : ""}`}
              style={getTextInlineStyle(variant, primary)}
            >
              {title}
            </Text>
          )}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}
