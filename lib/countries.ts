export interface Country {
  code: string;
  name: string;
  dial: string;
}

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export const COUNTRIES: Country[] = [
  { code: "AE", name: "United Arab Emirates", dial: "+971" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "BD", name: "Bangladesh", dial: "+880" },
  { code: "BR", name: "Brazil", dial: "+55" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "ES", name: "Spain", dial: "+34" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "ID", name: "Indonesia", dial: "+62" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "IT", name: "Italy", dial: "+39" },
  { code: "JP", name: "Japan", dial: "+81" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "KR", name: "South Korea", dial: "+82" },
  { code: "LK", name: "Sri Lanka", dial: "+94" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "MX", name: "Mexico", dial: "+52" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "NP", name: "Nepal", dial: "+977" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "PH", name: "Philippines", dial: "+63" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "SE", name: "Sweden", dial: "+46" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "TH", name: "Thailand", dial: "+66" },
  { code: "TR", name: "Turkey", dial: "+90" },
  { code: "TZ", name: "Tanzania", dial: "+255" },
  { code: "UG", name: "Uganda", dial: "+256" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "VN", name: "Vietnam", dial: "+84" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "ZM", name: "Zambia", dial: "+260" },
  { code: "ZW", name: "Zimbabwe", dial: "+263" },
];
