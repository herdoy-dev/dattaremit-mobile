import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, Landmark } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function AddBankScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center px-6 pt-4 pb-2"
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface"
        >
          <ArrowLeft size={20} color="#6B7280" />
        </Pressable>
        <Text className="text-xl font-bold text-light-text dark:text-dark-text">
          Add Bank
        </Text>
      </Animated.View>

      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="items-center"
        >
          <Landmark size={64} color={primary} />
          <Text className="mt-4 text-lg font-semibold text-light-text dark:text-dark-text">
            Coming soon
          </Text>
          <Text className="mt-2 text-center text-sm text-light-text-muted dark:text-dark-text-muted">
            You'll be able to link your bank account here.
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
