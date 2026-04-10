import { useAddressStore } from "@/store/addressStore";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useOrderStore } from "@/store/orderStore";
import { usePaymentSessionStore } from "@/store/paymentSessionStore";
import type { Order, PaymentMethod } from "@/types/order";
import { buildPaymentPayload, isOnlinePayment } from "@/utils/payment";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type TouchedFields = {
  fullName: boolean;
  phone: boolean;
  address: boolean;
};

export default function CheckoutScreen() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const addressesHydrated = useAddressStore((state) => state.hydrated);
  const savedAddresses = useAddressStore((state) => state.addresses);
  const addAddress = useAddressStore((state) => state.addAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const setPaymentPayload = usePaymentSessionStore((state) => state.setPayload);
  const [touched, setTouched] = useState<TouchedFields>({
    fullName: false,
    phone: false,
    address: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const checkoutHydrated = useCheckoutStore((state) => state.hydrated);
  const savedDetails = useCheckoutStore((state) => state.details);
  const saveCheckoutDetails = useCheckoutStore((state) => state.saveDetails);
  useEffect(() => {
    if (!checkoutHydrated) return;

    setFullName(savedDetails.fullName);
    setPhone(savedDetails.phone);
    setAddress(savedDetails.address);
  }, [checkoutHydrated, savedDetails]);
  const hydrated = useCartStore((state) => state.hydrated);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  if (!hydrated || !checkoutHydrated || !addressesHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Checkout</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#d96c8a" />
          <Text style={styles.loaderText}>Preparing your checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = items.length > 0 ? 150 : 0;
  const total = subtotal + deliveryFee;

  const nameError =
    touched.fullName && fullName.trim().length < 2
      ? "Please enter your full name."
      : "";

  const cleanedPhone = phone.replace(/[^\d]/g, "");
  const phoneError =
    touched.phone && cleanedPhone.length < 7
      ? "Please enter a valid phone number."
      : "";

  const addressError =
    touched.address && address.trim().length < 6
      ? "Please enter a complete delivery address."
      : "";

  const isFormValid =
    fullName.trim().length >= 2 &&
    cleanedPhone.length >= 7 &&
    address.trim().length >= 6;

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };
  const handleSelectAddress = (selected: {
    fullName: string;
    phone: string;
    address: string;
  }) => {
    setFullName(selected.fullName);
    setPhone(selected.phone);
    setAddress(selected.address);
  };

  const handleSaveAddress = () => {
    if (!fullName.trim() || !phone.trim() || !address.trim()) return;

    addAddress({
      id: `ADDR-${Date.now()}`,
      label: "Saved Address",
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  };
  const handlePlaceOrder = async () => {
    setTouched({
      fullName: true,
      phone: true,
      address: true,
    });

    if (!items.length || !isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await new Promise((resolve) => setTimeout(resolve, 900));

      const order: Order = {
        id: `ORD-${Date.now()}`,
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        })),
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        paymentMethod,
        subtotal,
        deliveryFee,
        total,
        totalItems,
        status: isOnlinePayment(paymentMethod) ? "pending_payment" : "placed", //Update checkout to create correct status
        createdAt: new Date().toISOString(),
      };
      const paymentPayload = buildPaymentPayload(order);

      if (isOnlinePayment(paymentMethod)) {
        addOrder(order);
        setPaymentPayload(paymentPayload);

        saveCheckoutDetails({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
        });

        clearCart();
        router.push("/payment-confirmation");
        return;
      }

      addOrder(order);

      saveCheckoutDetails({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      clearCart();
      router.replace("/order-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCheckoutDisabled = !items.length || !isFormValid || isSubmitting;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Checkout</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!items.length ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="bag-handle-outline" size={22} color="#d96c8a" />
              </View>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptyText}>
                Add products before proceeding to checkout.
              </Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.emptyButtonText}>Continue Shopping</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* saved addresses section to checkout  */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Saved Addresses</Text>
                    <Text style={styles.sectionSubtext}>
                      Quickly use a previously saved delivery address.
                    </Text>
                  </View>
                </View>

                {savedAddresses.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.addressList}
                  >
                    {savedAddresses.map((item) => (
                      <Pressable
                        key={item.id}
                        style={styles.addressCard}
                        onPress={() => handleSelectAddress(item)}
                      >
                        <Text style={styles.addressLabel}>{item.label}</Text>
                        <Text style={styles.addressName} numberOfLines={1}>
                          {item.fullName}
                        </Text>
                        <Text style={styles.addressPhone}>{item.phone}</Text>
                        <Text style={styles.addressText} numberOfLines={2}>
                          {item.address}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.noAddressText}>
                    No saved addresses yet.
                  </Text>
                )}

                <Pressable
                  style={styles.saveAddressBtn}
                  onPress={handleSaveAddress}
                >
                  <Text style={styles.saveAddressBtnText}>
                    Save Current Address
                  </Text>
                </Pressable>
              </View>
              {/* customer detail section  */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                    <Text style={styles.sectionSubtext}>
                      Enter your delivery information below.
                    </Text>
                  </View>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>Secure</Text>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    nameError ? styles.inputError : undefined,
                  ]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  value={fullName}
                  onChangeText={setFullName}
                  onBlur={() => handleBlur("fullName")}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
                {nameError ? (
                  <Text style={styles.fieldError}>{nameError}</Text>
                ) : null}

                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  ref={phoneRef}
                  style={[
                    styles.input,
                    phoneError ? styles.inputError : undefined,
                  ]}
                  placeholder="98XXXXXXXX"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  onBlur={() => handleBlur("phone")}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => addressRef.current?.focus()}
                />
                {phoneError ? (
                  <Text style={styles.fieldError}>{phoneError}</Text>
                ) : null}

                <Text style={styles.inputLabel}>Delivery Address</Text>
                <TextInput
                  ref={addressRef}
                  style={[
                    styles.input,
                    styles.textArea,
                    addressError ? styles.inputError : undefined,
                  ]}
                  placeholder="House no, street, area, city"
                  placeholderTextColor="#9ca3af"
                  value={address}
                  onChangeText={setAddress}
                  onBlur={() => handleBlur("address")}
                  multiline
                  textAlignVertical="top"
                />
                {addressError ? (
                  <Text style={styles.fieldError}>{addressError}</Text>
                ) : null}
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
                    <View
                      style={[
                        styles.paymentIconWrap,
                        paymentMethod === "cod" && styles.paymentIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name="cash-outline"
                        size={18}
                        color={paymentMethod === "cod" ? "#d96c8a" : "#6b7280"}
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.paymentText,
                          paymentMethod === "cod" && styles.paymentTextActive,
                        ]}
                      >
                        Cash on Delivery
                      </Text>
                      <Text style={styles.paymentSubtext}>
                        Pay when your order arrives
                      </Text>
                    </View>
                  </View>

                  {paymentMethod === "cod" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#d96c8a"
                    />
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
                    <View
                      style={[
                        styles.paymentIconWrap,
                        paymentMethod === "esewa" &&
                          styles.paymentIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name="phone-portrait-outline"
                        size={18}
                        color={
                          paymentMethod === "esewa" ? "#d96c8a" : "#6b7280"
                        }
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.paymentText,
                          paymentMethod === "esewa" && styles.paymentTextActive,
                        ]}
                      >
                        eSewa
                      </Text>
                      <Text style={styles.paymentSubtext}>
                        Fast and secure digital payment
                      </Text>
                    </View>
                  </View>

                  {paymentMethod === "esewa" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#d96c8a"
                    />
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
                    <View
                      style={[
                        styles.paymentIconWrap,
                        paymentMethod === "khalti" &&
                          styles.paymentIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={18}
                        color={
                          paymentMethod === "khalti" ? "#d96c8a" : "#6b7280"
                        }
                      />
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.paymentText,
                          paymentMethod === "khalti" &&
                            styles.paymentTextActive,
                        ]}
                      >
                        Khalti
                      </Text>
                      <Text style={styles.paymentSubtext}>
                        Pay with your Khalti wallet
                      </Text>
                    </View>
                  </View>

                  {paymentMethod === "khalti" && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#d96c8a"
                    />
                  )}
                </Pressable>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <Text style={styles.sectionSubtext}>
                  Review your order before placing it.
                </Text>

                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Items</Text>
                    <Text style={styles.summaryValue}>{totalItems}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      {formatPrice(subtotal)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>
                      {formatPrice(deliveryFee)}
                    </Text>
                  </View>

                  <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                    <Text style={styles.summaryTotalLabel}>Total</Text>
                    <Text style={styles.summaryTotalValue}>
                      {formatPrice(total)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {!!items.length && (
          <View style={styles.footer}>
            <View style={styles.footerTop}>
              <View>
                <Text style={styles.footerLabel}>Payable Total</Text>
                <Text style={styles.footerAmount}>{formatPrice(total)}</Text>
              </View>

              <View style={styles.footerPill}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#d96c8a"
                />
                <Text style={styles.footerPillText}>Trusted Checkout</Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.placeOrderBtn,
                isCheckoutDisabled && styles.placeOrderBtnDisabled,
              ]}
              onPress={handlePlaceOrder}
              disabled={isCheckoutDisabled}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.placeOrderText,
                    isCheckoutDisabled && styles.placeOrderTextDisabled,
                  ]}
                >
                  Place Order
                </Text>
              )}
            </Pressable>
          </View>
        )}
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
    paddingBottom: 28,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 4,
  },
  sectionBadge: {
    backgroundColor: "#fff1f5",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionBadgeText: {
    color: "#d96c8a",
    fontSize: 12,
    fontWeight: "700",
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
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff7f8",
    borderWidth: 1,
    borderColor: "#f0d7df",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111827",
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 12,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: "#f0d7df",
    backgroundColor: "#fff7f8",
    borderRadius: 16,
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
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  paymentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconWrapActive: {
    backgroundColor: "#fff7fa",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 3,
  },
  paymentTextActive: {
    color: "#d96c8a",
  },
  paymentSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  summaryCard: {
    backgroundColor: "#fff7f8",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f5dde4",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
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
    borderTopColor: "#f0d7df",
    paddingTop: 12,
    marginTop: 2,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#f1e5e8",
    backgroundColor: "#fffafb",
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  footerLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  footerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff1f5",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  footerPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d96c8a",
  },
  placeOrderBtn: {
    backgroundColor: "#d96c8a",
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderBtnDisabled: {
    backgroundColor: "#e5e7eb",
  },
  placeOrderText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  placeOrderTextDisabled: {
    color: "#9ca3af",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff1f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: "#d96c8a",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loaderText: {
    marginTop: 14,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  addressList: {
    paddingRight: 8,
    paddingBottom: 4,
  },
  addressCard: {
    width: 220,
    backgroundColor: "#fff7f8",
    borderWidth: 1,
    borderColor: "#f0d7df",
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#d96c8a",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#374151",
  },
  noAddressText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  saveAddressBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0d7df",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveAddressBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#d96c8a",
  },
});
