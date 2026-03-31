import { View, Text, FlatList, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { UserPlus, Users } from "lucide-react-native";
import { EmptyState } from "@/components/ui/empty-state";
import { COLORS } from "@/constants/theme";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Button } from "@/components/ui/button";
import { RecipientCard } from "@/components/transfer/recipient-card";
import { getRecipients, type Recipient } from "@/services/recipient";
import { useThemeColors } from "@/hooks/use-theme-colors";

interface RecipientListProps {
  onSelectRecipient: (recipient: Recipient) => void;
  onAddBank: (recipient: Recipient) => void;
}

export function RecipientList({ onSelectRecipient, onAddBank }: RecipientListProps) {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["recipients"],
    queryFn: getRecipients,
  });

  const handlePress = (recipient: Recipient) => {
    if (recipient.kycStatus === "APPROVED" && recipient.hasBankAccount) {
      onSelectRecipient(recipient);
    } else if (recipient.kycStatus === "APPROVED" && !recipient.hasBankAccount) {
      onAddBank(recipient);
    }
    // For PENDING/REJECTED/FAILED, tapping does nothing (card shows status)
  };

  return (
    <>
      <ScreenHeader title="Send Money" />

      {/* Add Recipient Button */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} className="px-6 pt-4">
        <Button
          title="Add Recipient"
          onPress={() => router.push("/(transfer)/add-recipient")}
          variant="outline"
          size="lg"
          icon={<UserPlus size={18} color={primary} />}
        />
      </Animated.View>

      {isLoading ? (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <FlatList
          data={recipients}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pt-4 pb-8"
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.delay(200 + index * 60).duration(400)}
              className="mb-3"
            >
              <RecipientCard recipient={item} onPress={() => handlePress(item)} />
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Users size={48} color={COLORS.placeholder} />}
              title="No recipients yet"
              description="Add one to get started"
            />
          }
        />
      )}
    </>
  );
}
