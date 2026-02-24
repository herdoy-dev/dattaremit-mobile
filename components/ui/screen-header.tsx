import { Text, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="flex-row items-center px-6 pt-4 pb-2"
    >
      <Pressable
        onPress={onBack ?? (() => router.back())}
        className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface"
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ArrowLeft size={20} color={COLORS.muted} />
      </Pressable>
      <Text className="text-xl font-bold text-light-text dark:text-dark-text">
        {title}
      </Text>
    </Animated.View>
  );
}
