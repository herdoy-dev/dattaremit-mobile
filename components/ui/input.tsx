import { FieldError } from "@/components/ui/field-error";
import { FieldLabel } from "@/components/ui/field-label";
import { COLORS } from "@/constants/theme";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: TextInput["props"]["keyboardType"];
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
  editable?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
  multiline?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  textColor?: string;
  textContentType?: TextInput["props"]["textContentType"];
  backgroundColor?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = "none",
  editable = true,
  icon,
  onPress,
  multiline = false,
  className = "",
  labelClassName,
  inputClassName,
  textColor,
  textContentType,
  backgroundColor,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const focusProgress = useSharedValue(0);
  const inputRef = useRef<TextInput>(null);
  const { border, borderFocus } = useThemeColors();

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? COLORS.error
      : interpolateColor(focusProgress.value, [0, 1], [border, borderFocus]),
  }));

  const content = (
    <View className={className}>
      <FieldLabel label={label} className={labelClassName} />
      <AnimatedView
        style={[borderStyle, { backgroundColor: backgroundColor ?? "transparent" }]}
        className="flex-row items-center rounded-xl border-2 px-4"
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable && !onPress}
          multiline={multiline}
          textContentType={textContentType ?? (secureTextEntry ? "oneTimeCode" : undefined)}
          autoComplete={secureTextEntry ? "off" : undefined}
          onFocus={() => {
            focusProgress.value = withTiming(1, { duration: 200 });
          }}
          onBlur={() => {
            focusProgress.value = withTiming(0, { duration: 200 });
          }}
          style={textColor ? { color: textColor } : undefined}
          className={`flex-1 py-3.5 text-base ${textColor ? "" : inputClassName || "text-light-text dark:text-dark-text"}`}
          accessibilityLabel={label}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={20} color={COLORS.placeholder} />
            ) : (
              <Eye size={20} color={COLORS.placeholder} />
            )}
          </Pressable>
        )}
      </AnimatedView>
      <FieldError error={error} />
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
