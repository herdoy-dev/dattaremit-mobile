import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function LoadingScreen() {
  const { primary } = useThemeColors();

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
      <ActivityIndicator size="large" color={primary} />
    </SafeAreaView>
  );
}
