import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { Search, Filter } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { TransactionItem } from "@/components/ui/transaction-item";
import { COLORS } from "@/constants/theme";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getTransactions } from "@/services/transactions";
import type { FilterType, Transaction } from "@/types/transaction";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Received", value: "received" },
];

const PAGE_SIZE = 20;

export default function ActivityTab() {
  const { primary, surface } = useThemeColors();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [
      "transactions",
      activeFilter === "all" ? undefined : activeFilter,
      searchQuery || undefined,
    ],
    queryFn: ({ pageParam }) =>
      getTransactions({
        cursor: pageParam ?? undefined,
        limit: PAGE_SIZE,
        type: activeFilter === "all" ? undefined : activeFilter,
        search: searchQuery || undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => <TransactionItem transaction={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color={primary} />
      </View>
    );
  }, [isFetchingNextPage, primary]);

  const renderEmpty = useCallback(
    () =>
      !isLoading ? (
        <View className="items-center justify-center py-16">
          <Filter size={48} color={COLORS.placeholder} />
          <Text className="mt-4 text-base font-medium text-light-text-muted dark:text-dark-text-muted">
            No transactions found
          </Text>
        </View>
      ) : null,
    [isLoading],
  );

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <View className="px-6 pb-2 pt-4">
        <Text className="text-2xl font-bold text-light-text dark:text-dark-text">Activity</Text>
        <Text className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Your transaction history
        </Text>
      </View>

      {/* Search */}
      <View className="px-6 pt-2">
        <Input
          label=""
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search transactions..."
          icon={<Search size={18} color={COLORS.placeholder} />}
          backgroundColor={surface}
        />
      </View>

      {/* Filter Chips */}
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        className="flex-row gap-2 px-6 pb-2 pt-4"
      >
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.value}
            onPress={() => setActiveFilter(filter.value)}
            className={`rounded-full px-5 py-2 ${
              activeFilter !== filter.value ? "bg-light-surface dark:bg-dark-surface" : ""
            }`}
            style={activeFilter === filter.value ? { backgroundColor: primary } : undefined}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${filter.label}`}
            accessibilityState={{ selected: activeFilter === filter.value }}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter.value
                  ? "text-white"
                  : "text-light-text-secondary dark:text-dark-text-secondary"
              }`}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
