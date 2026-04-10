import { useOrderStore } from "@/store/orderStore";
import { usePaymentSessionStore } from "@/store/paymentSessionStore";
import { getPaymentLabel } from "@/utils/payment";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function PaymentConfirmationScreen() {
  const payload = usePaymentSessionStore((state) => state.payload);
  const clearPayload = usePaymentSessionStore((state) => state.clearPayload);
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  if (!payload) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons name="wallet-outline" size={28} color="#d96c8a" />
          </View>

          <Text style={styles.title}>No payment session found</Text>
          <Text style={styles.subtitle}>
            Start again from checkout to continue with online payment.
          </Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace("/checkout")}
          >
            <Text style={styles.primaryBtnText}>Back to Checkout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirmPayment = () => {
    updateOrderStatus(payload.orderId, "paid");
    clearPayload();
    router.replace("/order-success");
  };

  const handleCancel = () => {
    clearPayload();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>Payment Confirmation</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Demo Payment Step</Text>
        </View>

        <View style={styles.iconWrap}>
          <Ionicons name="wallet-outline" size={30} color="#d96c8a" />
        </View>

        <Text style={styles.title}>{getPaymentLabel(payload.method)}</Text>
        <Text style={styles.subtitle}>
          This screen simulates the online payment step before real gateway
          integration.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order ID</Text>
            <Text style={styles.summaryValue}>{payload.orderId}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer</Text>
            <Text style={styles.summaryValue}>{payload.customerName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phone</Text>
            <Text style={styles.summaryValue}>{payload.phone}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Amount</Text>
            <Text style={styles.totalValue}>{formatPrice(payload.amount)}</Text>
          </View>
        </View>

        <Pressable style={styles.primaryBtn} onPress={handleConfirmPayment}>
          <Text style={styles.primaryBtnText}>Confirm Payment</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={handleCancel}>
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f8",
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  badge: {
    alignSelf: "center",
    backgroundColor: "#fff1f5",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d96c8a",
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff1f5",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 22,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f3e4e8",
    paddingTop: 12,
    marginTop: 2,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  primaryBtn: {
    backgroundColor: "#d96c8a",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0d7df",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
});
