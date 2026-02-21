import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { SendHorizontal } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/hooks/use-theme-colors";

interface HoldButtonProps {
  onComplete: () => void;
  duration?: number;
  loading?: boolean;
  disabled?: boolean;
}

export function HoldButton({
  onComplete,
  duration = 3000,
  loading = false,
  disabled = false,
}: HoldButtonProps) {
  const { primary } = useThemeColors();
  const progress = useSharedValue(0);
  const completed = useSharedValue(false);
  const [buttonWidth, setButtonWidth] = useState(0);

  const fireComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!loading) {
      completed.value = false;
    }
  }, [loading, completed]);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * buttonWidth,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    left: progress.value * buttonWidth - 20,
  }));

  function handlePressIn() {
    if (loading || disabled || completed.value) return;
    progress.value = withTiming(
      1,
      { duration, easing: Easing.linear },
      (finished) => {
        if (finished) {
          completed.value = true;
          runOnJS(fireComplete)();
        }
      },
    );
  }

  function handlePressOut() {
    if (completed.value || loading) return;
    progress.value = withSpring(0, { damping: 15, stiffness: 120 });
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      onLayout={(e) => setButtonWidth(e.nativeEvent.layout.width)}
      style={{ borderColor: primary, borderWidth: 2 }}
      className={`h-16 w-full items-center justify-center overflow-hidden rounded-full ${disabled ? "opacity-50" : ""}`}
    >
      {/* Progress fill */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            backgroundColor: primary,
            borderRadius: 9999,
            zIndex: 1,
          },
          progressStyle,
        ]}
      />

      {/* Send icon riding the leading edge */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            justifyContent: "center",
            zIndex: 2,
          },
          iconStyle,
        ]}
      >
        <SendHorizontal size={18} color="#fff" />
      </Animated.View>

      {/* Content — above the fill */}
      <View style={{ zIndex: 3 }}>
        {loading ? (
          <ActivityIndicator color={primary} size="small" />
        ) : (
          <Text className="text-lg font-semibold" style={{ color: primary }}>
            Hold to Send
          </Text>
        )}
      </View>
    </Pressable>
  );
}
