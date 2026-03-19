import { useState } from "react";
import { View, Text, Switch } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Landmark, CheckCircle2, Link2, Zap } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import { COLORS } from "@/constants/theme";

interface PlaidBankFlowProps {
  hasBankAccount: boolean;
  achPushEnabled: boolean;
  primary: string;
  plaid: {
    initiate: () => void;
    isLoading: boolean;
    error: string | null;
  };
  onGate: (action: () => void) => void;
}

export function PlaidBankFlow({
  hasBankAccount,
  achPushEnabled,
  primary,
  plaid,
  onGate,
}: PlaidBankFlowProps) {
  const [useFastTransfer, setUseFastTransfer] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(600).springify()}
      className="items-center gap-5 pt-8"
    >
      <View
        className="h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: hasBankAccount ? "#22c55e15" : `${primary}15` }}
      >
        {hasBankAccount ? (
          <CheckCircle2 size={36} color="#16a34a" />
        ) : (
          <Landmark size={36} color={primary} />
        )}
      </View>

      <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
        {hasBankAccount ? "Bank Account Linked" : "Connect Your Bank"}
      </Text>

      <Text className="text-light-muted dark:text-dark-muted px-4 text-center text-base leading-6">
        {hasBankAccount
          ? "Your bank account has been successfully linked."
          : "Securely link your bank account using Plaid. Your credentials are never shared with us."}
      </Text>

      {!hasBankAccount && achPushEnabled && (
        <View className="w-full flex-row items-center justify-between rounded-xl border border-light-border px-4 py-3 dark:border-dark-border">
          <View className="flex-1 flex-row items-center gap-3">
            <Zap size={20} color="#f59e0b" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                Fast Transfer
              </Text>
              <Text className="text-light-muted dark:text-dark-muted text-xs">
                {useFastTransfer ? "Instant ACH push" : "Regular ACH pull (1-3 days)"}
              </Text>
            </View>
          </View>
          <Switch value={useFastTransfer} onValueChange={setUseFastTransfer} />
        </View>
      )}

      {plaid.error && <ErrorBanner message={plaid.error} />}

      <Button
        title={hasBankAccount ? "Connect Different Bank Account" : "Connect Bank Account"}
        onPress={() => onGate(() => plaid.initiate())}
        loading={plaid.isLoading}
        size="lg"
        icon={<Link2 size={20} color={COLORS.white} className="mr-1" />}
        className="mt-4 w-full"
      />
    </Animated.View>
  );
}
