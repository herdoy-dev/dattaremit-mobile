import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Megaphone,
  Gift,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useNotificationBanner, dismissBanner } from "@/store/notification-banner-store";
import { getNotificationRoute, getNotificationColor } from "@/lib/notification-helpers";

export function NotificationBanner() {
  const banner = useNotificationBanner();
  const router = useRouter();

  if (!banner) return null;

  const color = getNotificationColor(banner.type);

  function handlePress() {
    dismissBanner();
    const route = getNotificationRoute(banner?.type);
    if (route) router.push(route as never);
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      className="absolute left-4 right-4 top-12 z-50"
    >
      <Pressable
        onPress={handlePress}
        className="flex-row items-center gap-3 rounded-2xl bg-light-surface p-4 shadow-lg dark:bg-dark-surface"
        accessibilityRole="button"
        accessibilityLabel={`Notification: ${banner.title}`}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <NotificationIcon type={banner.type} color={color} />
        </View>
        <View className="flex-1">
          <Text
            className="text-sm font-semibold text-light-text dark:text-dark-text"
            numberOfLines={1}
          >
            {banner.title}
          </Text>
          <Text
            className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted"
            numberOfLines={2}
          >
            {banner.body}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function NotificationIcon({ type, color }: { type?: string; color: string }) {
  const size = 20;
  switch (type) {
    case "KYC_APPROVED":
    case "ACCOUNT_ACTIVATED":
    case "TRANSACTION_COMPLETED":
    case "PROFILE_UPDATED":
      return <CheckCircle2 size={size} color={color} />;
    case "KYC_REJECTED":
    case "KYC_FAILED":
    case "TRANSACTION_FAILED":
      return <XCircle size={size} color={color} />;
    case "KYC_PENDING":
    case "TRANSACTION_INITIATED":
      return <Clock size={size} color={color} />;
    case "SYSTEM_ALERT":
    case "PASSWORD_CHANGED":
      return <AlertTriangle size={size} color={color} />;
    case "PROMOTIONAL":
      return <Megaphone size={size} color={color} />;
    case "REFERRAL_BONUS":
      return <Gift size={size} color={color} />;
    default:
      return <Bell size={size} color={color} />;
  }
}
