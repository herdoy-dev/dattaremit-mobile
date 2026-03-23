export type AutocompletePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type ValidationStatus = "VALID" | "NEEDS_REVIEW" | "INVALID" | "UNAVAILABLE";

export type AddressComponents = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
};

export type AddressValidationResult = {
  validationStatus: ValidationStatus;
  validationGranularity?: string;
  addressComplete?: boolean;
  formattedAddress?: string;
  corrections?: { field: string; original: string; corrected: string }[];
};
