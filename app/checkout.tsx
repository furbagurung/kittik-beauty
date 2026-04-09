import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type PaymentMethod = "cod" | "esewa" | "khalti";

export default function CheckoutScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const deliveryFee = items.length > 0 ? 150 : 0;
  const total = subtotal + deliveryFee;

  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length > 1 &&
      phone.trim().length >= 7 &&
      address.trim().length > 5
    );
  }, [fullName, phone, address]);

  const handlePlaceOrder = () => {
    if (!isFormValid) {
      setError("Please fill all fields correctly.");
      return;
    }

    setError("");
    clearCart();
    router.replace("/order-success");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.title}>Checkout</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <Text style={styles.sectionSubtext}>
            Please enter your delivery information.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Delivery Address"
            placeholderTextColor="#9ca3af"
            value={address}
            onChangeText={setAddress}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.sectionSubtext}>
            Select your preferred payment option.
          </Text>

          <Pressable
            style={[
              styles.paymentOption,
              paymentMethod === "cod" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("cod")}
          >
            <View style={styles.paymentLeft}>
              <Ionicons
                name="cash-outline"
                size={18}
                color={paymentMethod === "cod" ? "#d96c8a" : "#6b7280"}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "cod" && styles.paymentTextActive,
                ]}
              >
                Cash on Delivery
              </Text>
            </View>

            {paymentMethod === "cod" && (
              <Ionicons name="checkmark-circle" size={20} color="#d96c8a" />
            )}
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              paymentMethod === "esewa" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("esewa")}
          >
            <View style={styles.paymentLeft}>
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color={paymentMethod === "esewa" ? "#d96c8a" : "#6b7280"}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "esewa" && styles.paymentTextActive,
                ]}
              >
                eSewa
              </Text>
            </View>

            {paymentMethod === "esewa" && (
              <Ionicons name="checkmark-circle" size={20} color="#d96c8a" />
            )}
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              paymentMethod === "khalti" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod("khalti")}
          >
            <View style={styles.paymentLeft}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={paymentMethod === "khalti" ? "#d96c8a" : "#6b7280"}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "khalti" && styles.paymentTextActive,
                ]}
              >
                Khalti
              </Text>
            </View>

            {paymentMethod === "khalti" && (
              <Ionicons name="checkmark-circle" size={20} color="#d96c8a" />
            )}
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <Text style={styles.sectionSubtext}>
            Review your order before placing it.
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{items.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <Text style={styles.footerLabel}>Payable Total</Text>
          <Text style={styles.footerAmount}>{formatPrice(total)}</Text>
        </View>

        <Pressable
          style={[
            styles.placeOrderBtn,
            !isFormValid && styles.placeOrderBtnDisabled,
          ]}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Place Order</Text>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  sectionSubtext: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
    marginBottom: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 10,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff7f8",
    borderWidth: 1,
    borderColor: "#f0d7df",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: "#f0d7df",
    backgroundColor: "#fff7f8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentOptionActive: {
    borderColor: "#d96c8a",
    backgroundColor: "#fff1f5",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  paymentTextActive: {
    color: "#d96c8a",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    marginTop: 6,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff7f8",
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  footerAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  placeOrderBtn: {
    backgroundColor: "#d96c8a",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
  },
  placeOrderBtnDisabled: {
    opacity: 0.55,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
