import { Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppErrorFallbackProps {
  onReset: () => void;
}

export function AppErrorFallback({ onReset }: AppErrorFallbackProps) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-center text-2xl font-bold text-gray-900">
        Something went wrong
      </Text>
      <Text className="mb-8 text-center text-base text-gray-500">
        An unexpected error occurred. Please try again.
      </Text>

      <Pressable
        onPress={onReset}
        className="mb-3 w-full rounded-xl bg-blue-600 py-4"
      >
        <Text className="text-center text-base font-semibold text-white">
          Try Again
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
