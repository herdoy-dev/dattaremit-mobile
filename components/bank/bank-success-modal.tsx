import { useEffect } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CheckCircle2 } from "lucide-react-native";
import { hexToRgba } from "@/lib/utils";

interface BankSuccessModalProps {
  visible: boolean;
  onDismiss: () => void;
  primary: string;
  surface: string;
  themeVars: Record<string, string>;
}

export function BankSuccessModal({
  visible,
  onDismiss,
  primary,
  surface,
  themeVars,
}: BankSuccessModalProps) {
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      cardOpacity.value = withTiming(1, { duration: 300 });
      iconScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 150 }));
      textOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
      buttonOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      accessibilityViewIsModal={true}
    >
      <View style={[{ flex: 1 }, themeVars]} className="items-center justify-center">
        <Animated.View style={backdropStyle} className="absolute inset-0 bg-black/50" />

        <Animated.View
          style={[cardStyle, { backgroundColor: surface }]}
          className="mx-8 rounded-3xl p-8"
        >
          <View className="items-center">
            <Animated.View
              style={[iconStyle, { backgroundColor: hexToRgba("#22c55e", 0.1) }]}
              className="mb-6 h-20 w-20 items-center justify-center rounded-full"
            >
              <CheckCircle2 size={36} color="#16a34a" />
            </Animated.View>

            <Animated.View style={textStyle} className="items-center">
              <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                Bank Account Linked!
              </Text>
              <Text className="mt-3 text-center text-sm leading-6 text-light-text-secondary dark:text-dark-text-secondary">
                Your bank account has been successfully connected. You can now send and receive
                transfers.
              </Text>
            </Animated.View>

            <Animated.View style={buttonStyle} className="mt-8 w-full">
              <Pressable
                onPress={onDismiss}
                className="h-14 items-center justify-center rounded-full"
                style={{ backgroundColor: primary }}
                accessibilityRole="button"
                accessibilityLabel="Got it, continue to app"
              >
                <Text className="text-lg font-semibold text-white">Got it</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
