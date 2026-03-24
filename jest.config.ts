import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|nativewind|react-native-css-interop|@tanstack/react-query|lucide-react-native|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-svg|expo-router|expo-linking|expo-constants|expo-modules-core|expo-clipboard|expo-haptics|expo-image|expo-local-authentication|expo-secure-store|expo-splash-screen|expo-status-bar|expo-web-browser|expo-auth-session|expo-crypto|expo-font|react-native-plaid-link-sdk)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "store/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
    "./lib/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
