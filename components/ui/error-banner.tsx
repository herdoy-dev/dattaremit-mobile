import { View, Text } from "react-native";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <View
      className="rounded-xl bg-red-50 p-3 dark:bg-red-900/20"
      accessibilityRole="alert"
    >
      <Text className="text-sm text-red-600 dark:text-red-400">{message}</Text>
    </View>
  );
}
