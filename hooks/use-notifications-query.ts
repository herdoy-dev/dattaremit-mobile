import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/services/notifications";
import type { PaginatedNotifications, Notification } from "@/types/notification";

const PAGE_SIZE = 20;

export function useNotificationsQuery(filter?: { isRead?: boolean }) {
  return useInfiniteQuery<PaginatedNotifications>({
    queryKey: ["notifications", "list", filter],
    queryFn: ({ pageParam }) =>
      getNotifications({
        offset: pageParam as number,
        limit: PAGE_SIZE,
        isRead: filter?.isRead,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return fetched < lastPage.total ? fetched : undefined;
    },
    initialPageParam: 0,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", "list"] });
      const previousLists = queryClient.getQueriesData({ queryKey: ["notifications", "list"] });

      queryClient.setQueriesData<{
        pages: PaginatedNotifications[];
        pageParams: number[];
      }>({ queryKey: ["notifications", "list"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((item: Notification) =>
              item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item,
            ),
          })),
        };
      });

      return { previousLists };
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}
