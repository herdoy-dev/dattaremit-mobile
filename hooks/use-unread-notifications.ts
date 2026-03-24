import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/notifications";

export function useUnreadNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
}
