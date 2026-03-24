import { COUNTRIES } from "@/lib/countries";

// Sort dial codes longest-first so "+880" matches before "+8"
const dialCodesSorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

export function splitPhoneNumber(fullPhone: string): {
  prefix: string;
  number: string;
} {
  const trimmed = fullPhone.trim();
  for (const country of dialCodesSorted) {
    if (trimmed.startsWith(country.dial)) {
      return {
        prefix: country.dial,
        number: trimmed.slice(country.dial.length).replace(/\D/g, ""),
      };
    }
  }
  // Fallback: try to extract prefix manually
  const match = trimmed.match(/^(\+\d{1,4})(\d+)$/);
  if (match) return { prefix: match[1], number: match[2] };
  return { prefix: "+1", number: trimmed.replace(/\D/g, "") };
}
