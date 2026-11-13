import { useSignUp } from "@clerk/expo";
import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { clerkErrorMessage } from "@/lib/clerk-errors";
import { useTheme } from "@/lib/theme";
import { Button, ErrorText, Input } from "@/lib/ui";

export default function SignUpScreen() {
  const t = useTheme();
  const { signUp, fetchStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = fetchStatus === "fetching";

  async function submit() {
    setError(null);
    const { error } = await signUp.password({ emailAddress: email.trim(), password });
    if (error) return setError(clerkErrorMessage(error));
    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) return setError(clerkErrorMessage(sent.error));
    setVerifying(true);
  }

  async function verify() {
    setError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) return setError(clerkErrorMessage(error));
    if (signUp.status === "complete") {
      const done = await signUp.finalize();
      setError(clerkErrorMessage(done.error));
    } else {
      setError("Sign-up isn't complete yet. Check the code and try again.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: t.background }]}
    >
      <View style={styles.form}>
        <Text style={[styles.title, { color: t.text }]}>Create your account</Text>
        {verifying ? (
          <>
            <Text style={{ color: t.muted }}>Enter the code we emailed to {email}.</Text>
            <Input
              value={code}
              onChangeText={setCode}
              placeholder="Verification code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
            />
            <ErrorText>{error}</ErrorText>
            <Button title="Verify email" onPress={verify} loading={busy} disabled={!code} />
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
              autoComplete="new-password"
            />
            <ErrorText>{error}</ErrorText>
            <Button
              title="Sign up"
              onPress={submit}
              loading={busy}
              disabled={!email || !password}
            />
            {/* Clerk's bot protection renders here when enabled. */}
            <View nativeID="clerk-captcha" />
            <Link href="/sign-in" style={{ color: t.accent, textAlign: "center", padding: 8 }}>
              Have an account? Sign in
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
