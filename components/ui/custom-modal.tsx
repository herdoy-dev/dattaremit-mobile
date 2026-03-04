import { useEffect, useState } from "react";
import { View, Pressable, Dimensions, Modal } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { buildThemeVars } from "@/store/theme-store";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoint?: number;
}

export function CustomModal({
  visible,
  onClose,
  children,
  snapPoint = 0.5,
}: CustomModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const maxTranslateY = SCREEN_HEIGHT * (1 - snapPoint);
  const { surface, border, rawColors } = useThemeColors();
  const themeVars = buildThemeVars(rawColors);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.value = withSpring(maxTranslateY, {
        damping: 20,
        stiffness: 200,
      });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
      // Delay hiding the Modal until animation finishes
      const timer = setTimeout(() => setModalVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible, maxTranslateY, translateY, backdropOpacity]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newY = maxTranslateY + event.translationY;
      translateY.value = Math.max(newY, maxTranslateY);
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(maxTranslateY, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={modalVisible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[{ flex: 1 }, themeVars]}>
          <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, backdropStyle]}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
            />
          </Animated.View>

          <Animated.View
            style={[
              sheetStyle,
              {
                height: SCREEN_HEIGHT,
                position: "absolute",
                left: 0,
                right: 0,
                backgroundColor: surface,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
              },
            ]}
          >
            <GestureDetector gesture={panGesture}>
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
                <View
                  style={{
                    height: 4,
                    width: 40,
                    borderRadius: 2,
                    backgroundColor: border,
                  }}
                />
              </View>
            </GestureDetector>
            <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>
              {children}
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
