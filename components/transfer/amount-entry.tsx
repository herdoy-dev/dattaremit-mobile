import { View, Text, Pressable, TextInput } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { ArrowLeft, User, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { HoldButton } from "@/components/ui/hold-button";
import type { Contact } from "@/services/transfer";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";
import { COLORS } from "@/constants/theme";

interface AmountEntryProps {
  selectedContact: Contact;
  amount: string;
  onAmountChange: (text: string) => void;
  amountError: string | null;
  note: string;
  onNoteChange: (text: string) => void;
  onSend: () => void;
  onBack: () => void;
  isSending: boolean;
}

export function AmountEntry({
  selectedContact,
  amount,
  onAmountChange,
  amountError,
  note,
  onNoteChange,
  onSend,
  onBack,
  isSending,
}: AmountEntryProps) {
  const router = useRouter();
  const { primary } = useThemeColors();

  return (
    <>
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
            onPress={onBack}
            className="mb-6 flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
          >
            <View
              className="mr-3 h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: hexToRgba(primary, 0.1) }}
            >
              <User size={20} color={primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-light-text dark:text-dark-text">
                {selectedContact.name}
              </Text>
              <Text className="text-xs text-light-text-muted dark:text-dark-text-muted">
                {selectedContact.email}
              </Text>
            </View>
            <ChevronRight size={18} color={COLORS.placeholder} />
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
              onChangeText={onAmountChange}
              placeholder="0.00"
              placeholderTextColor={COLORS.placeholder}
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
            onChangeText={onNoteChange}
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
          <HoldButton onComplete={onSend} loading={isSending} />
        </Animated.View>
      </View>
    </>
  );
}
