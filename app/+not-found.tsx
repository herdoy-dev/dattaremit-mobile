import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-bold text-light-text dark:text-dark-text">
          Page Not Found
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          The page you're looking for doesn't exist.
        </Text>
        <View className="mt-6">
          <Button title="Go Home" onPress={() => router.replace("/")} />
        </View>
      </View>
    </SafeAreaView>
  );
}
