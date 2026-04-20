import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignupScreen() {
  const signup = useAuthStore((state) => state.signup);
  const { redirectTo } = useLocalSearchParams<{
    redirectTo?: string;
  }>();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const isValid =
    fullName.trim().length >= 2 &&
    email.trim().includes("@") &&
    password.length >= 6;

  const handleSignup = async () => {
    if (!isValid || submitting) return;

    try {
      setSubmitting(true);
      setAuthError("");

      await signup(fullName.trim(), email.trim(), password);

      if (redirectTo) {
        router.replace(redirectTo as any);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Signup failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Ionicons name="sparkles-outline" size={26} color="#DC2626" />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Sign up to save your beauty picks, orders, and checkout details.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {!!authError && <Text style={styles.errorText}>{authError}</Text>}

            <Pressable
              style={[
                styles.primaryBtn,
                (!isValid || submitting) && styles.primaryBtnDisabled,
              ]}
              onPress={handleSignup}
              disabled={!isValid || submitting}
            >
              <Text style={styles.primaryBtnText}>
                {submitting ? "Creating Account..." : "Create Account"}
              </Text>
            </Pressable>

            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.linkText}>
                Already have an account? Login
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FEF2F2",
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#DC2626",
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 14,
  },
  primaryBtnDisabled: {
    backgroundColor: "#e5e7eb",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  linkText: {
    textAlign: "center",
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 12,
    fontWeight: "600",
  },
});
