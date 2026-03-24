import { Text, FlatList } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Search } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ContactCard } from "@/components/transfer/contact-card";
import { searchContacts, type Contact } from "@/services/transfer";
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
  const { data: contacts = [], isLoading: isSearching } = useQuery({
    queryKey: ["contacts", searchQuery],
    queryFn: () => searchContacts(searchQuery),
  });

  return (
    <>
      <ScreenHeader title="Send Money" />

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} className="px-6 pt-4">
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
            className="mb-3"
          >
            <ContactCard contact={item} onPress={() => onSelectContact(item)} />
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
