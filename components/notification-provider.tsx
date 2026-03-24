import { useAuth } from "@clerk/clerk-expo";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useNotificationHandler } from "@/hooks/use-notification-handler";
import { NotificationBanner } from "@/components/ui/notification-banner";

export function NotificationProvider() {
  const { isSignedIn } = useAuth();

  usePushNotifications(!!isSignedIn);
  useNotificationHandler();

  return <NotificationBanner />;
}
