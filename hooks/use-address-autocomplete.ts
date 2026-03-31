import { useState, useRef, useCallback } from "react";
import { randomUUID } from "expo-crypto";
import { addressService } from "@/services/address";
import type { AddressComponents, AutocompletePrediction } from "@/types/address";

const DEBOUNCE_MS = 300;
const MIN_INPUT_LENGTH = 3;

interface LocationContext {
  state?: string;
  city?: string;
}

interface AutocompleteOptions {
  country?: "US";
  locationContext?: LocationContext;
  types?: string;
  mode?: "full" | "simple";
}

export function useAddressAutocomplete(options?: AutocompleteOptions) {
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<AutocompletePrediction | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<AddressComponents | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTokenRef = useRef<string>(randomUUID());

  const onSearchChange = useCallback(
    (text: string) => {
      // Clear previous selection when user types
      if (selectedPrediction) {
        setSelectedPrediction(null);
        setSelectedComponents(null);
        sessionTokenRef.current = randomUUID();
      }

      if (timerRef.current) clearTimeout(timerRef.current);

      if (text.length < MIN_INPUT_LENGTH) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      timerRef.current = setTimeout(async () => {
        try {
          const results = await addressService.autocomplete(
            text,
            options?.country,
            sessionTokenRef.current,
            options?.locationContext?.city,
            options?.locationContext?.state,
            options?.types,
          );
          setSuggestions(results);
        } catch {
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, DEBOUNCE_MS);
    },
    [
      options?.country,
      selectedPrediction,
      options?.locationContext?.city,
      options?.locationContext?.state,
      options?.types,
    ],
  );

  const onSelect = useCallback(
    async (prediction: AutocompletePrediction) => {
      setSelectedPrediction(prediction);
      setSuggestions([]);
      setIsSearching(false);

      if (options?.mode === "simple") {
        // No place details needed — caller just wants the text
        sessionTokenRef.current = randomUUID();
        return;
      }

      // Fetch full address components from place details
      const currentToken = sessionTokenRef.current;
      sessionTokenRef.current = randomUUID();
      setIsFetchingDetails(true);

      try {
        const components = await addressService.getPlaceDetails(prediction.placeId, currentToken);
        setSelectedComponents(components);
      } catch {
        // Fall back — keep just the street from mainText
        setSelectedComponents(null);
      } finally {
        setIsFetchingDetails(false);
      }
    },
    [options?.mode],
  );

  const reset = useCallback(() => {
    setSuggestions([]);
    setIsSearching(false);
    setSelectedPrediction(null);
    setSelectedComponents(null);
    setIsFetchingDetails(false);
    sessionTokenRef.current = randomUUID();
  }, []);

  return {
    suggestions,
    isSearching,
    onSearchChange,
    onSelect,
    selectedPrediction,
    selectedComponents,
    isFetchingDetails,
    reset,
  };
}
