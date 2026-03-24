import { View, Text, TextInput } from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { HoldButton } from "@/components/ui/hold-button";
import { ContactCard } from "@/components/transfer/contact-card";
import { FieldError } from "@/components/ui/field-error";
import { FieldLabel } from "@/components/ui/field-label";
import type { Contact } from "@/services/transfer";
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
  currency?: string;
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
  currency = "$",
}: AmountEntryProps) {
  return (
    <>
      <ScreenHeader title="Send Money" />

      <View className="flex-1 px-6 pt-4">
        {/* Selected Contact */}
        <Animated.View entering={FadeInRight.duration(400)} className="mb-6">
          <ContactCard contact={selectedContact} onPress={onBack} />
        </Animated.View>

        {/* Amount Input */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} className="mb-4">
          <FieldLabel label="Amount" />
          <View className="flex-row items-center rounded-xl border-2 border-gray-200 bg-light-surface px-4 dark:border-gray-700 dark:bg-dark-surface">
            <Text className="text-2xl font-bold text-light-text dark:text-dark-text">
              {currency}
            </Text>
            <TextInput
              value={amount}
              onChangeText={onAmountChange}
              placeholder="0.00"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="decimal-pad"
              className="flex-1 py-4 pl-2 text-2xl font-bold text-light-text dark:text-dark-text"
              accessibilityLabel="Transfer amount"
            />
          </View>
          <FieldError error={amountError} />
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
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="pb-10">
          <HoldButton onComplete={onSend} loading={isSending} />
        </Animated.View>
      </View>
    </>
  );
}
