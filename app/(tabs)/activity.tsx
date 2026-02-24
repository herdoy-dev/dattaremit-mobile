import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Search, Filter } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { TransactionItem } from "@/components/ui/transaction-item";
import { COLORS } from "@/constants/theme";
import { ALL_TRANSACTIONS } from "@/__mocks__/transactions";
import type { FilterType } from "@/types/transaction";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Received", value: "received" },
];

export default function ActivityTab() {
  const { primary } = useThemeColors();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = useMemo(() => {
    return ALL_TRANSACTIONS.filter((tx) => {
      const matchesFilter =
        activeFilter === "all" || tx.type === activeFilter;
      const matchesSearch =
        !searchQuery ||
        tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
          Activity
        </Text>
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
        />
      </View>

      {/* Filter Chips */}
      <Animated.View
        entering={FadeIn.delay(200).duration(400)}
        className="flex-row gap-2 px-6 pt-4 pb-2"
      >
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.value}
            onPress={() => setActiveFilter(filter.value)}
            className={`rounded-full px-5 py-2 ${
              activeFilter !== filter.value
                ? "bg-light-surface dark:bg-dark-surface"
                : ""
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
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Filter size={48} color={COLORS.placeholder} />
            <Text className="mt-4 text-base font-medium text-light-text-muted dark:text-dark-text-muted">
              No transactions found
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {filteredTransactions.map((tx, index) => (
              <Animated.View
                key={tx.id}
                entering={FadeInDown.delay(index * 60).duration(400)}
              >
                <TransactionItem transaction={tx} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
