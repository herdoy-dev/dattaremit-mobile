import { useEffect, useRef } from "react";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";
import { showBanner } from "@/store/notification-banner-store";
import { getNotificationRoute } from "@/lib/notification-helpers";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof import("expo-notifications") | null = null;
if (!isExpoGo) {
  Notifications = require("expo-notifications");

  // Configure foreground behavior: suppress system notification, use in-app banner instead
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false,
    }),
  });
}

export function useNotificationHandler() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const responseListenerRef = useRef<{ remove(): void } | null>(null);
  const receivedListenerRef = useRef<{ remove(): void } | null>(null);

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

      showBanner({
        title: title ?? "New notification",
        body: body ?? "",
        type: data?.type as string | undefined,
        data: data as Record<string, string> | undefined,
      });

      // Refresh unread count
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
