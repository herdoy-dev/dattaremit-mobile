import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Landmark,
  User,
  Hash,
  Building2,
  Link2,
  Zap,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAccountQuery } from "@/hooks/use-account-query";
import { useForm } from "@/hooks/use-form";
import { usePlaidLink } from "@/hooks/use-plaid-link";
import { useBiometricGate } from "@/hooks/use-biometric-gate";
import { BiometricVerifyOverlay } from "@/components/biometric/biometric-verify-overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { ErrorBanner } from "@/components/ui/error-banner";
import { onboardingService } from "@/services/onboarding";
import { getApiErrorMessage, hexToRgba } from "@/lib/utils";
import {
  validateRequired,
  validateAccountNumber,
  validateRoutingNumber,
} from "@/lib/validation";
import { COLORS } from "@/constants/theme";
import { buildThemeVars } from "@/store/theme-store";

const ACCOUNT_TYPE_OPTIONS = [
  { label: "Savings", value: "SAVINGS" },
  { label: "Current", value: "CURRENT" },
];

export default function AddBankScreen() {
  const router = useRouter();
  const { primary, surface, rawColors } = useThemeColors();
  const themeVars = buildThemeVars(rawColors);

  const { data: account, isLoading: isAccountLoading } = useAccountQuery();

  const accountStatus = account?.data?.accountStatus;
  const address = account?.data?.addresses?.[0];
  const isUSUser = address?.country === "US";
  const achPushEnabled = account?.data?.user?.achPushEnabled;
  const hasBankAccount = !!account?.data?.hasBankAccount;
  const [useFastTransfer, setUseFastTransfer] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.85);
  const cardOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    if (showSuccessModal) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      cardOpacity.value = withTiming(1, { duration: 300 });
      iconScale.value = withDelay(
        200,
        withSpring(1, { damping: 12, stiffness: 150 }),
      );
      textOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
      buttonOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
    }
  }, [showSuccessModal]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleSuccessDismiss = () => {
    router.back();
  };

  const { gate, isVerifying } = useBiometricGate({
    promptMessage: "Verify your identity to link a bank account",
  });

  const plaid = usePlaidLink({
    onSuccess: () => setShowSuccessModal(true),
    paymentRail:
      achPushEnabled && useFastTransfer ? "ach_push" : "ach_pull",
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
      setShowSuccessModal(true);
    },
  });

  const handleSubmit = async () => {
    if (!validate()) return;
    await gate(() => {
      mutation.mutate({
        bankName: values.bankName,
        accountHolderName: values.accountHolderName,
        accountNumber: values.accountNumber,
        routingNumber: values.routingNumber.toUpperCase(),
        type: values.type,
      });
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
          ) : accountStatus !== "ACTIVE" ? (
            <Animated.View
              entering={FadeInDown.delay(200).duration(600).springify()}
              className="items-center gap-5 pt-8"
            >
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: `${primary}15` }}
              >
                <ShieldCheck size={36} color={primary} />
              </View>

              <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                Verify Your Identity
              </Text>

              <Text className="text-center text-base leading-6 text-light-muted dark:text-dark-muted px-4">
                {accountStatus === "PENDING"
                  ? "Your KYC verification is being reviewed. You'll be able to connect your bank account once it's approved."
                  : "Complete your KYC verification to connect your bank account."}
              </Text>

              {accountStatus !== "PENDING" && (
                <Button
                  title="Complete KYC"
                  onPress={() => router.push("/(onboarding)/kyc")}
                  size="lg"
                  className="mt-4 w-full"
                />
              )}
            </Animated.View>
          ) : isUSUser ? (
            /* Plaid flow for US users */
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

              <Text className="text-center text-base leading-6 text-light-muted dark:text-dark-muted px-4">
                {hasBankAccount
                  ? "Your bank account has been successfully linked."
                  : "Securely link your bank account using Plaid. Your credentials are never shared with us."}
              </Text>

              {!hasBankAccount && achPushEnabled && (
                <View className="w-full flex-row items-center justify-between rounded-xl border border-light-border dark:border-dark-border px-4 py-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Zap size={20} color="#f59e0b" />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                        Fast Transfer
                      </Text>
                      <Text className="text-xs text-light-muted dark:text-dark-muted">
                        {useFastTransfer
                          ? "Instant ACH push"
                          : "Regular ACH pull (1-3 days)"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={useFastTransfer}
                    onValueChange={setUseFastTransfer}
                  />
                </View>
              )}

              {plaid.error && <ErrorBanner message={plaid.error} />}

              <Button
                title={hasBankAccount ? "Connect Different Bank Account" : "Connect Bank Account"}
                onPress={() => gate(() => plaid.initiate())}
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

      <BiometricVerifyOverlay visible={isVerifying} />

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="none"
        statusBarTranslucent
        accessibilityViewIsModal={true}
      >
        <View
          style={[{ flex: 1 }, themeVars]}
          className="items-center justify-center"
        >
          <Animated.View
            style={backdropStyle}
            className="absolute inset-0 bg-black/50"
          />

          <Animated.View
            style={[cardStyle, { backgroundColor: surface }]}
            className="mx-8 rounded-3xl p-8"
          >
            <View className="items-center">
              <Animated.View
                style={[
                  iconStyle,
                  { backgroundColor: hexToRgba("#22c55e", 0.1) },
                ]}
                className="mb-6 h-20 w-20 items-center justify-center rounded-full"
              >
                <CheckCircle2 size={36} color="#16a34a" />
              </Animated.View>

              <Animated.View style={textStyle} className="items-center">
                <Text className="text-xl font-bold text-light-text dark:text-dark-text">
                  Bank Account Linked!
                </Text>
                <Text className="mt-3 text-center text-sm leading-6 text-light-text-secondary dark:text-dark-text-secondary">
                  Your bank account has been successfully connected. You can now
                  send and receive transfers.
                </Text>
              </Animated.View>

              <Animated.View style={buttonStyle} className="mt-8 w-full">
                <Pressable
                  onPress={handleSuccessDismiss}
                  className="h-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: primary }}
                  accessibilityRole="button"
                  accessibilityLabel="Got it, continue to app"
                >
                  <Text className="text-lg font-semibold text-white">
                    Got it
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
