import { useEffect } from "react";
import { MapPin, Building2, Hash } from "lucide-react-native";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Input } from "@/components/ui/input";
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete";
import { COLORS } from "@/constants/theme";
import type { AddressComponents } from "@/types/address";

export interface AddressFieldValues {
  state: string;
  city: string;
  street: string;
  postalCode: string;
}

interface AddressFieldsProps {
  values: AddressFieldValues;
  errors: Partial<Record<keyof AddressFieldValues, string | null>>;
  setValue: (field: keyof AddressFieldValues, value: string) => void;
  country?: "US";
  /** Called with full address components when street auto-fill fires */
  onAutoFill?: (components: AddressComponents) => void;
}

export function AddressFields({
  values,
  errors,
  setValue,
  country = "US",
  onAutoFill,
}: AddressFieldsProps) {
  const stateAC = useAddressAutocomplete({
    country,
    types: "(regions)",
    mode: "simple",
  });

  const cityAC = useAddressAutocomplete({
    country,
    locationContext: { state: values.state },
    types: "(cities)",
    mode: "simple",
  });

  const streetAC = useAddressAutocomplete({
    country,
    locationContext: { state: values.state, city: values.city },
    types: "address",
    mode: "full",
  });

  // Auto-fill all fields when street place details are fetched
  useEffect(() => {
    const sc = streetAC.selectedComponents;
    if (sc) {
      if (sc.street) setValue("street", sc.street);
      if (sc.city) setValue("city", sc.city);
      if (sc.state) setValue("state", sc.state);
      if (sc.postalCode) setValue("postalCode", sc.postalCode);
      onAutoFill?.(sc);
    }
  }, [streetAC.selectedComponents, setValue, onAutoFill]);

  const handleStreetChange = (text: string) => {
    setValue("street", text);
    streetAC.onSearchChange(text);
  };

  const handleStateChange = (text: string) => {
    setValue("state", text);
    stateAC.onSearchChange(text);
  };

  const handleCityChange = (text: string) => {
    setValue("city", text);
    cityAC.onSearchChange(text);
  };

  return (
    <>
      <AddressAutocomplete
        label="State / Province"
        value={values.state}
        onChangeText={handleStateChange}
        suggestions={stateAC.suggestions}
        onSelect={(p) => setValue("state", p.mainText)}
        isLoading={stateAC.isSearching}
        placeholder="Enter state or province"
        emptyText="No states found"
        error={errors.state}
        icon={<Building2 size={20} color={COLORS.placeholder} />}
        className="z-40"
      />

      <AddressAutocomplete
        label="City"
        value={values.city}
        onChangeText={handleCityChange}
        suggestions={cityAC.suggestions}
        onSelect={(p) => setValue("city", p.mainText)}
        isLoading={cityAC.isSearching}
        placeholder="Enter your city"
        emptyText="No cities found"
        error={errors.city}
        icon={<MapPin size={20} color={COLORS.placeholder} />}
        className="z-30"
      />

      <AddressAutocomplete
        label="Street Address"
        value={values.street}
        onChangeText={handleStreetChange}
        suggestions={streetAC.suggestions}
        onSelect={(p) => {
          setValue("street", p.mainText);
          streetAC.onSelect(p);
        }}
        isLoading={streetAC.isSearching}
        placeholder="Enter your street address"
        error={errors.street}
        icon={<MapPin size={20} color={COLORS.placeholder} />}
        className="z-50"
      />

      <Input
        label="Postal Code"
        value={values.postalCode}
        onChangeText={(t) => setValue("postalCode", t)}
        placeholder="Enter postal code"
        keyboardType="number-pad"
        error={errors.postalCode}
        icon={<Hash size={20} color={COLORS.placeholder} />}
      />
    </>
  );
}
