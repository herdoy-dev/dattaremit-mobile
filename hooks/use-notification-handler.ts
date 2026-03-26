import { useEffect, useRef } from "react";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useRouter, usePathname } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { showBanner } from "@/store/notification-banner-store";
import { getNotificationRoute } from "@/lib/notification-helpers";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Module-level state shared with setNotificationHandler
let currentPathname = "";
export function setCurrentPathname(path: string) {
  currentPathname = path;
}

let Notifications: typeof import("expo-notifications") | null = null;
if (!isExpoGo) {
  Notifications = require("expo-notifications");

  // Configure foreground behavior: show both system push and in-app banner,
  // except when on the notifications screen (WhatsApp-like suppression)
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      const isOnNotificationsScreen = currentPathname === "/notifications";
      return {
        shouldShowAlert: !isOnNotificationsScreen,
        shouldPlaySound: !isOnNotificationsScreen,
        shouldSetBadge: false,
        shouldShowBanner: !isOnNotificationsScreen,
        shouldShowList: !isOnNotificationsScreen,
      };
    },
  });
}

export function useNotificationHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const responseListenerRef = useRef<{ remove(): void } | null>(null);
  const receivedListenerRef = useRef<{ remove(): void } | null>(null);
  const pathnameRef = useRef(pathname);

  // Keep refs in sync so listener callbacks always have the latest value
  useEffect(() => {
    pathnameRef.current = pathname;
    setCurrentPathname(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!Notifications) return;

    // Notification received while app is in foreground
    receivedListenerRef.current = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;

      Sentry.addBreadcrumb({
        category: "notification",
        message: `Received: ${title}`,
        data: { type: data?.type },
        level: "info",
      });

      const isOnNotificationsScreen = pathnameRef.current === "/notifications";

      if (isOnNotificationsScreen) {
        // Smart suppression: skip banner, refresh list directly
        queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      } else {
        // Show in-app banner alongside the system push notification
        showBanner({
          title: title ?? "New notification",
          body: body ?? "",
          type: data?.type as string | undefined,
          data: data as Record<string, string> | undefined,
        });
      }

      // Always refresh unread count
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    });

    // User tapped on a notification (from background or killed state)
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;

        Sentry.addBreadcrumb({
          category: "notification",
          message: "Notification tapped",
          data: { type: data?.type },
          level: "info",
        });

        const route = getNotificationRoute(data?.type as string | undefined);
        router.push(route as never);

        // Refresh notifications data
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    );

    return () => {
      receivedListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, [router, queryClient]);
}
