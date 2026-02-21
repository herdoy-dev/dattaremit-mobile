import { View, Text, Pressable, FlatList } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ArrowLeft, Search, User, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { searchContacts, type Contact } from "@/services/transfer";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { hexToRgba } from "@/store/theme-store";
import { COLORS } from "@/constants/theme";

interface ContactSelectProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectContact: (contact: Contact) => void;
}

export function ContactSelect({
  searchQuery,
  onSearchChange,
  onSelectContact,
}: ContactSelectProps) {
  const router = useRouter();
  const { primary } = useThemeColors();

  const { data: contacts = [], isLoading: isSearching } = useQuery({
    queryKey: ["contacts", searchQuery],
    queryFn: () => searchContacts(searchQuery),
  });

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

      {/* Search */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        className="px-6 pt-4"
      >
        <Input
          label="Search Contacts"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Name, email, or phone"
          icon={<Search size={18} color={COLORS.placeholder} />}
        />
      </Animated.View>

      {/* Contact List */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 pt-4 pb-8"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(200 + index * 60).duration(400)}
          >
            <Pressable
              onPress={() => onSelectContact(item)}
              className="mb-3 flex-row items-center rounded-2xl bg-light-surface p-4 dark:bg-dark-surface"
            >
              <View
                className="mr-3 h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: hexToRgba(primary, 0.1) }}
              >
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
              <ChevronRight size={18} color={COLORS.placeholder} />
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
    </>
  );
}
