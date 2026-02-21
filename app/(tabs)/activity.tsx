import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
} from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { useThemeColors } from "@/hooks/use-theme-colors";

type FilterType = "all" | "sent" | "received";

interface Transaction {
  id: string;
  name: string;
  type: "sent" | "received";
  amount: string;
  date: string;
  category: string;
}

const TRANSACTIONS: Transaction[] = [
  { id: "1", name: "John Doe", type: "sent", amount: "-$250.00", date: "Feb 21, 2026", category: "Transfer" },
  { id: "2", name: "Salary Deposit", type: "received", amount: "+$3,500.00", date: "Feb 20, 2026", category: "Income" },
  { id: "3", name: "Netflix", type: "sent", amount: "-$15.99", date: "Feb 18, 2026", category: "Subscription" },
  { id: "4", name: "Jane Smith", type: "received", amount: "+$120.00", date: "Feb 17, 2026", category: "Transfer" },
  { id: "5", name: "Uber Ride", type: "sent", amount: "-$24.50", date: "Feb 16, 2026", category: "Transport" },
  { id: "6", name: "Freelance Payment", type: "received", amount: "+$850.00", date: "Feb 15, 2026", category: "Income" },
  { id: "7", name: "Amazon", type: "sent", amount: "-$67.99", date: "Feb 14, 2026", category: "Shopping" },
  { id: "8", name: "Refund - Store", type: "received", amount: "+$45.00", date: "Feb 13, 2026", category: "Refund" },
  { id: "9", name: "Electricity Bill", type: "sent", amount: "-$89.00", date: "Feb 12, 2026", category: "Utilities" },
  { id: "10", name: "Mike Johnson", type: "received", amount: "+$200.00", date: "Feb 11, 2026", category: "Transfer" },
];

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
    return TRANSACTIONS.filter((tx) => {
      const matchesFilter =
        activeFilter === "all" || tx.type === activeFilter;
      const matchesSearch =
        !searchQuery ||
        tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
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
          icon={<Search size={18} color="#9CA3AF" />}
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
            <Filter size={48} color="#9CA3AF" />
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
                <Pressable className="flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface">
                  <View
                    className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
                      tx.type === "received"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {tx.type === "received" ? (
                      <TrendingDown size={20} color="#059669" />
                    ) : (
                      <TrendingUp size={20} color="#EF4444" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                      {tx.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted">
                      {tx.category} · {tx.date}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm font-bold ${
                      tx.type === "received"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500"
                    }`}
                  >
                    {tx.amount}
                  </Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
