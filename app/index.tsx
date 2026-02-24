import { View, ActivityIndicator } from "react-native";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAppBootstrap } from "@/hooks/use-app-bootstrap";

export default function IndexScreen() {
  const { primary } = useThemeColors();
  useAppBootstrap();

  return (
    <View className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
      <ActivityIndicator size="large" color={primary} />
    </View>
  );
}
