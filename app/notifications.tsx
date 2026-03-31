import { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, BellOff, CheckCheck } from "lucide-react-native";
import { EmptyState } from "@/components/ui/empty-state";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { NotificationItem } from "@/components/ui/notification-item";
import {
  useNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/hooks/use-notifications-query";
import type { Notification } from "@/types/notification";
import { COLORS } from "@/constants/theme";

type FilterTab = "all" | "unread";

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const router = useRouter();
  const { primary } = useThemeColors();

  const filter = activeTab === "unread" ? { isRead: false } : undefined;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } =
    useNotificationsQuery(filter);

  const markAsRead = useMarkAsReadMutation();
  const markAllAsRead = useMarkAllAsReadMutation();
  const deleteNotification = useDeleteNotificationMutation();

  const notifications = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem
        notification={item}
        onMarkAsRead={(id) => markAsRead.mutate(id)}
        onDelete={(id) => deleteNotification.mutate(id)}
        onNavigate={(route) => router.push(route as never)}
      />
    ),
    [markAsRead, deleteNotification, router],
  );

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} className="text-light-text dark:text-dark-text" />
        </Pressable>
        <Text className="text-lg font-bold text-light-text dark:text-dark-text">Notifications</Text>
        <Pressable
          onPress={() => markAllAsRead.mutate()}
          className="h-10 w-10 items-center justify-center rounded-full"
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
          disabled={markAllAsRead.isPending}
        >
          <CheckCheck size={20} color={primary} />
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row gap-2 px-4 pb-3">
        {(["all", "unread"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 ${activeTab === tab ? "opacity-100" : "opacity-50"}`}
            style={activeTab === tab ? { backgroundColor: primary } : undefined}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab ? "text-white" : "text-light-text dark:text-dark-text"
              }`}
            >
              {tab === "all" ? "All" : "Unread"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Notification List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={primary}
            />
          }
          ItemSeparatorComponent={() => (
            <View className="h-px bg-light-surface dark:bg-dark-surface" />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<BellOff size={48} color={COLORS.muted} />}
              title="No notifications yet"
              description="We will notify you about important updates"
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator size="small" color={primary} />
              </View>
            ) : null
          }
          contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
        />
      )}
    </SafeAreaView>
  );
}
