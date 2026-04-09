import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function OrderSuccessScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={36} color="#ffffff" />
        </View>

        <Text style={styles.title}>Order Placed Successfully</Text>

        <Text style={styles.subtitle}>
          Thank you for shopping with Kittik Beauty. Your order has been placed
          successfully.
        </Text>

        <Text style={styles.note}>
          You’ll be able to add real order tracking and payment confirmation
          here later.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.primaryBtnText}>Continue Shopping</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f8",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#d96c8a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 28,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 28,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  secondaryBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0d7df",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtn: {
    backgroundColor: "#d96c8a",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
