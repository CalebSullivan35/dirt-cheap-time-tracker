import { useSignIn } from "@clerk/expo";
import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { clerkErrorMessage } from "@/lib/clerk-errors";
import { useTheme } from "@/lib/theme";
import { Button, ErrorText, Input } from "@/lib/ui";

export default function SignInScreen() {
  const t = useTheme();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = fetchStatus === "fetching";

  async function finishIfComplete() {
    if (signIn.status === "complete") {
      const { error } = await signIn.finalize();
      setError(clerkErrorMessage(error));
      return true;
    }
    return false;
  }

  async function submitPassword() {
    setError(null);
    const { error } = await signIn.password({ emailAddress: email.trim(), password });
    if (error) return setError(clerkErrorMessage(error));
    if (await finishIfComplete()) return;
    if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
      // New device check: Clerk emails a one-time code.
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) return setError(clerkErrorMessage(error));
      setNeedsCode(true);
      return;
    }
    setError(`Sign-in needs another step (${signIn.status}) that this app doesn't support yet.`);
  }

  async function submitCode() {
    setError(null);
    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) return setError(clerkErrorMessage(error));
    if (!(await finishIfComplete())) setError("That code didn't finish sign-in. Try again.");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: t.background }]}
    >
      <View style={styles.form}>
        <Text style={[styles.title, { color: t.text }]}>DirtCheapTimeTracker</Text>
        {needsCode ? (
          <>
            <Text style={{ color: t.muted }}>We emailed a code to {email}.</Text>
            <Input
              value={code}
              onChangeText={setCode}
              placeholder="Verification code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
            />
            <ErrorText>{error}</ErrorText>
            <Button title="Verify" onPress={submitCode} loading={busy} disabled={!code} />
          </>
        ) : (
          <>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              autoComplete="password"
            />
            <ErrorText>{error}</ErrorText>
            <Button
              title="Sign in"
              onPress={submitPassword}
              loading={busy}
              disabled={!email || !password}
            />
            <Link href="/sign-up" style={{ color: t.accent, textAlign: "center", padding: 8 }}>
              No account? Sign up
            </Link>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 24 },
  form: { gap: 12 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 12, textAlign: "center" },
});
