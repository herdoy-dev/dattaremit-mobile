import { memo } from "react";
import { View, Text, Pressable } from "react-native";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { Transaction } from "@/types/transaction";

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem = memo(function TransactionItem({
  transaction: tx,
}: TransactionItemProps) {
  const isReceived = tx.type === "received";

  return (
    <Pressable
      className="flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
      accessibilityRole="button"
      accessibilityLabel={`${tx.name}, ${isReceived ? "received" : "sent"} ${tx.amount}${tx.category ? `, ${tx.category}` : ""}, ${tx.date}`}
    >
      <View
        className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
          isReceived ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
        }`}
      >
        {isReceived ? (
          <ArrowDownLeft size={20} color={COLORS.success} />
        ) : (
          <ArrowUpRight size={20} color={COLORS.error} />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-light-text dark:text-dark-text">{tx.name}</Text>
        <Text className="mt-0.5 text-xs text-light-text-muted dark:text-dark-text-muted">
          {tx.category ? `${tx.category} · ` : ""}
          {tx.date}
        </Text>
      </View>
      <Text
        className={`text-sm font-bold ${
          isReceived ? "text-green-600 dark:text-green-400" : "text-red-500"
        }`}
      >
        {tx.amount}
      </Text>
    </Pressable>
  );
});
