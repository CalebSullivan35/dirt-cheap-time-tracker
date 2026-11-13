import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { useTheme } from "@/lib/theme";

export default function AppLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const t = useTheme();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.surface },
        headerTintColor: t.text,
        contentStyle: { backgroundColor: t.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Timer" }} />
      <Stack.Screen name="new-entry" options={{ title: "Add time", presentation: "modal" }} />
    </Stack>
  );
}
