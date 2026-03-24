import { useEffect, useState } from "react";
import { Text } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { WifiOff } from "lucide-react-native";
import NetInfo from "@react-native-community/netinfo";
import { COLORS } from "@/constants/theme";

export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      className="flex-row items-center justify-center gap-2 bg-red-500 px-4 py-2"
    >
      <WifiOff size={16} color={COLORS.white} />
      <Text className="text-sm font-medium text-white">No internet connection</Text>
    </Animated.View>
  );
}
