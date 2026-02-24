import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Landmark,
  User,
  Hash,
  Building2,
  Link2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useForm } from "@/hooks/use-form";
import { usePlaidLink } from "@/hooks/use-plaid-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { ErrorBanner } from "@/components/ui/error-banner";
import { onboardingService } from "@/services/onboarding";
import { getApiErrorMessage } from "@/lib/utils";
import {
  validateRequired,
  validateAccountNumber,
  validateRoutingNumber,
} from "@/lib/validation";
import { COLORS } from "@/constants/theme";

const ACCOUNT_TYPE_OPTIONS = [
  { label: "Savings", value: "SAVINGS" },
  { label: "Current", value: "CURRENT" },
];

export default function AddBankScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: account, isLoading: isAccountLoading } = useAccountQuery();

  const address = account?.data?.addresses?.[0];
  const isUSUser = address?.country === "US";

  const plaid = usePlaidLink({
    onSuccess: () => router.back(),
  });

  const { values, errors, setValue, validate } = useForm(
    {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      routingNumber: "",
      type: "",
    },
    {
      bankName: (v) => validateRequired(v, "Bank name"),
      accountHolderName: (v) => validateRequired(v, "Account holder name"),
      accountNumber: (v) => validateAccountNumber(v),
      routingNumber: (v) => validateRoutingNumber(v),
      type: (v) => validateRequired(v, "Account type"),
    },
  );

  const mutation = useMutation({
    mutationFn: onboardingService.addDepositAccount,
    onSuccess: () => {
      router.back();
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      bankName: values.bankName,
      accountHolderName: values.accountHolderName,
      accountNumber: values.accountNumber,
      routingNumber: values.routingNumber.toUpperCase(),
      type: values.type,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScreenHeader title="Add Bank" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          {isAccountLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={primary} />
            </View>
          ) : isUSUser ? (
            /* Plaid flow for US users */
            <Animated.View
              entering={FadeInDown.delay(200).duration(600).springify()}
              className="items-center gap-5 pt-8"
            >
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Landmark size={36} color={primary} />
              </View>

              <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                Connect Your Bank
              </Text>

              <Text className="text-center text-base leading-6 text-light-muted dark:text-dark-muted px-4">
                Securely link your bank account using Plaid. Your credentials
                are never shared with us.
              </Text>

              {plaid.error && <ErrorBanner message={plaid.error} />}

              <Button
                title="Connect Bank Account"
                onPress={plaid.initiate}
                loading={plaid.isLoading}
                size="lg"
                icon={<Link2 size={20} color={COLORS.white} className="mr-1" />}
                className="mt-4 w-full"
              />
            </Animated.View>
          ) : (
            /* Manual form for non-US users */
            <Animated.View
              entering={FadeInDown.delay(200).duration(600).springify()}
              className="gap-5"
            >
              <Input
                label="Bank Name"
                value={values.bankName}
                onChangeText={(t) => setValue("bankName", t)}
                placeholder="Enter bank name"
                autoCapitalize="words"
                error={errors.bankName}
                icon={<Building2 size={20} color={COLORS.placeholder} />}
              />

              <Input
                label="Account Holder Name"
                value={values.accountHolderName}
                onChangeText={(t) => setValue("accountHolderName", t)}
                placeholder="Enter account holder name"
                autoCapitalize="words"
                error={errors.accountHolderName}
                icon={<User size={20} color={COLORS.placeholder} />}
              />

              <Input
                label="Account Number"
                value={values.accountNumber}
                onChangeText={(t) => setValue("accountNumber", t)}
                placeholder="Enter account number"
                keyboardType="number-pad"
                error={errors.accountNumber}
                icon={<Hash size={20} color={COLORS.placeholder} />}
              />

              <Input
                label="IFSC / Routing Number"
                value={values.routingNumber}
                onChangeText={(t) => setValue("routingNumber", t)}
                placeholder="e.g. SBIN0001234"
                autoCapitalize="characters"
                error={errors.routingNumber}
                icon={<Landmark size={20} color={COLORS.placeholder} />}
              />

              <CustomDropdown
                label="Account Type"
                options={ACCOUNT_TYPE_OPTIONS}
                value={values.type}
                onChange={(v) => setValue("type", v)}
                placeholder="Select account type"
                error={errors.type}
              />

              {mutation.isError && (
                <ErrorBanner
                  message={getApiErrorMessage(
                    mutation.error,
                    "Failed to add bank account. Please try again."
                  )}
                />
              )}

              <Button
                title="Add Bank Account"
                onPress={handleSubmit}
                loading={mutation.isPending}
                size="lg"
                className="mt-2"
              />
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
