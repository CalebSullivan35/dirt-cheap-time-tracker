import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ApiProvider } from "@/lib/api";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error("Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in apps/mobile/.env (see .env.example)");
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ApiProvider>
        <StatusBar style="auto" />
        <Slot />
      </ApiProvider>
    </ClerkProvider>
  );
}
