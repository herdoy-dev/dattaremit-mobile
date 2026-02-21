import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import {
  ArrowLeft,
  Search,
  User,
  ChevronRight,
  CheckCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { HoldButton } from "@/components/ui/hold-button";
import { Input } from "@/components/ui/input";
import {
  searchContacts,
  sendMoney,
  type Contact,
} from "@/services/transfer";
import { validateAmount } from "@/lib/validation";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";

type Step = "select" | "amount" | "success";

export default function SendScreen() {
  const router = useRouter();
  const { primary } = useThemeColors();
  const [step, setStep] = useState<Step>("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  const { data: contacts = [], isLoading: isSearching } = useQuery({
    queryKey: ["contacts", searchQuery],
    queryFn: () => searchContacts(searchQuery),
  });

  const mutation = useMutation({
    mutationFn: sendMoney,
    onSuccess: (data) => {
      setTransactionId(data.transactionId);
      setStep("success");
    },
  });

  function handleSelectContact(contact: Contact) {
    setSelectedContact(contact);
    setStep("amount");
  }

  function handleSend() {
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      return;
    }
    setAmountError(null);
    if (!selectedContact) return;
    mutation.mutate({
      contactId: selectedContact.id,
      amount: parseFloat(amount),
      note: note || undefined,
    });
  }

  if (step === "success") {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="items-center"
          >
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle size={48} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              Transfer Successful
            </Text>
            <Text className="mt-2 text-center text-base text-light-text-secondary dark:text-dark-text-secondary">
              ${parseFloat(amount).toFixed(2)} sent to{" "}
              {selectedContact?.name}
            </Text>
            <Text className="mt-1 text-sm text-light-text-muted dark:text-dark-text-muted">
              Transaction ID: {transactionId}
            </Text>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            className="mt-10 w-full"
          >
            <Button title="Done" onPress={() => router.back()} size="lg" />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === "amount") {
    return (
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="flex-row items-center px-6 pt-4 pb-2"
          >
            <Pressable
              onPress={() => router.back()}
              className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface"
            >
              <ArrowLeft size={20} color="#6B7280" />
            </Pressable>
            <Text className="text-xl font-bold text-light-text dark:text-dark-text">
              Send Money
            </Text>
          </Animated.View>

          <View className="flex-1 px-6 pt-4">
            {/* Selected Contact */}
            <Animated.View entering={FadeInRight.duration(400)}>
              <Pressable
                onPress={() => setStep("select")}
                className="mb-6 flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
              >
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(primary, 0.1) }}>
                  <User size={20} color={primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                    {selectedContact?.name}
                  </Text>
                  <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    {selectedContact?.email}
                  </Text>
                </View>
                <ChevronRight size={18} color="#9CA3AF" />
              </Pressable>
            </Animated.View>

            {/* Amount Input */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              className="mb-4"
            >
              <Text className="mb-1.5 text-sm font-medium text-light-text dark:text-dark-text">
                Amount
              </Text>
              <View className="flex-row items-center rounded-xl border-2 border-gray-200 bg-light-surface px-4 dark:border-gray-700 dark:bg-dark-surface">
                <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
                  $
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (amountError) setAmountError(null);
                  }}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className="flex-1 py-4 pl-2 text-2xl font-bold text-light-text dark:text-dark-text"
                />
              </View>
              {amountError && (
                <Text className="mt-1 text-xs text-red-500">{amountError}</Text>
              )}
            </Animated.View>

            {/* Note */}
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Input
                label="Note (optional)"
                value={note}
                onChangeText={setNote}
                placeholder="What's this for?"
                multiline
              />
            </Animated.View>

            <View className="flex-1" />

            {/* Send Button */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              className="pb-10"
            >
              <HoldButton
                onComplete={handleSend}
                loading={mutation.isPending}
              />
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Step: select
  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="flex-row items-center px-6 pt-4 pb-2"
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-light-surface dark:bg-dark-surface"
        >
          <ArrowLeft size={20} color="#6B7280" />
        </Pressable>
        <Text className="text-xl font-bold text-light-text dark:text-dark-text">
          Send Money
        </Text>
      </Animated.View>

      {/* Search */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        className="px-6 pt-4"
      >
        <Input
          label="Search Contacts"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Name, email, or phone"
          icon={<Search size={18} color="#9CA3AF" />}
        />
      </Animated.View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(200 + index * 60).duration(400)}>
            <Pressable
              onPress={() => handleSelectContact(item)}
              className="mb-3 flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
            >
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(primary, 0.1) }}>
                <User size={20} color={primary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                  {item.name}
                </Text>
                <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
                  {item.email}
                </Text>
              </View>
              <ChevronRight size={18} color="#9CA3AF" />
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          !isSearching ? (
            <Text className="mt-8 text-center text-sm text-light-text-muted dark:text-dark-text-muted">
              No contacts found
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
