import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CheckCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/constants/theme";

interface SendSuccessProps {
  amount: string;
  recipientName: string;
  transactionId: string;
  currency?: string;
}

export function SendSuccess({
  amount,
  recipientName,
  transactionId,
  currency = "$",
}: SendSuccessProps) {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-6">
      <Animated.View entering={FadeInDown.delay(100).duration(500)} className="items-center">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle size={48} color={COLORS.success} />
        </View>
        <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
          Transfer Successful
        </Text>
        <Text className="mt-2 text-center text-base text-light-text-secondary dark:text-dark-text-secondary">
          {currency}
          {parseFloat(amount).toFixed(2)} sent to {recipientName}
        </Text>
        <Text className="mt-1 text-sm text-light-text-muted dark:text-dark-text-muted">
          Transaction ID: {transactionId}
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mt-10 w-full">
        <Button title="Done" onPress={() => router.back()} size="lg" />
      </Animated.View>
    </View>
  );
}
