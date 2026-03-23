import apiClient from "@/lib/api-client";
import type {
  AddressComponents,
  AutocompletePrediction,
  AddressValidationResult,
} from "@/types/address";

export const addressService = {
  async autocomplete(
    input: string,
    country?: "US" | "IN",
    sessionToken?: string,
    city?: string,
    state?: string,
    types?: string,
  ) {
    const params: Record<string, string> = { input };
    if (country) params.country = country;
    if (sessionToken) params.sessionToken = sessionToken;
    if (city) params.city = city;
    if (state) params.state = state;
    if (types) params.types = types;
    const response = await apiClient.get("/google-maps/autocomplete", { params });
    return response.data.data as AutocompletePrediction[];
  },

  async getPlaceDetails(placeId: string, sessionToken?: string) {
    const params: Record<string, string> = { placeId };
    if (sessionToken) params.sessionToken = sessionToken;
    const response = await apiClient.get("/google-maps/place-details", { params });
    return response.data.data as AddressComponents;
  },

  async validateAddress(address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    country: "US" | "IN";
    postalCode: string;
  }) {
    const response = await apiClient.post("/google-maps/validate-address", address);
    return response.data.data as AddressValidationResult;
  },
};
