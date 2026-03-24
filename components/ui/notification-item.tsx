import { View, Text, Pressable } from "react-native";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Megaphone,
  Gift,
  Trash2,
} from "lucide-react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useRef } from "react";
import type { Notification } from "@/types/notification";
import { COLORS } from "@/constants/theme";
import {
  getNotificationColor,
  getNotificationRoute,
  formatRelativeTime,
} from "@/lib/notification-helpers";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (route: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const color = getNotificationColor(notification.type);

  function handlePress() {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    const route = getNotificationRoute(notification.type);
    onNavigate(route);
  }

  function renderRightActions() {
    return (
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          onDelete(notification.id);
        }}
        className="items-center justify-center rounded-r-2xl bg-red-500 px-6"
        accessibilityRole="button"
        accessibilityLabel="Delete notification"
      >
        <Trash2 size={20} color={COLORS.white} />
      </Pressable>
    );
  }

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <Pressable
        onPress={handlePress}
        className="flex-row items-center gap-3 bg-light-surface p-4 dark:bg-dark-surface"
        accessibilityRole="button"
        accessibilityLabel={`${notification.title}, ${notification.isRead ? "read" : "unread"}`}
      >
        {/* Unread indicator */}
        <View className="w-2 items-center">
          {!notification.isRead && <View className="h-2 w-2 rounded-full bg-blue-500" />}
        </View>

        {/* Icon */}
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <NotificationIcon type={notification.type} color={color} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text
            className={`text-sm text-light-text dark:text-dark-text ${
              !notification.isRead ? "font-bold" : "font-medium"
            }`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text
            className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted"
            numberOfLines={2}
          >
            {notification.body}
          </Text>
          <Text className="mt-1 text-xs text-light-text-muted/60 dark:text-dark-text-muted/60">
            {formatRelativeTime(notification.created_at)}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

function NotificationIcon({ type, color }: { type: string; color: string }) {
  const size = 20;
  switch (type) {
    case "KYC_APPROVED":
    case "ACCOUNT_ACTIVATED":
    case "TRANSACTION_COMPLETED":
      return <CheckCircle2 size={size} color={color} />;
    case "KYC_REJECTED":
    case "KYC_FAILED":
    case "TRANSACTION_FAILED":
      return <XCircle size={size} color={color} />;
    case "KYC_PENDING":
    case "TRANSACTION_INITIATED":
      return <Clock size={size} color={color} />;
    case "SYSTEM_ALERT":
      return <AlertTriangle size={size} color={color} />;
    case "PROMOTIONAL":
      return <Megaphone size={size} color={color} />;
    case "REFERRAL_BONUS":
      return <Gift size={size} color={color} />;
    default:
      return <Bell size={size} color={color} />;
  }
}
