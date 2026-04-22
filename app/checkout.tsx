import { api } from "@/services/api";
import { initiatePayment } from "@/services/payments/paymentClient";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { usePaymentSessionStore } from "@/store/paymentSessionStore";
import type { Order, PaymentMethod } from "@/types/order";

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
  const token = useAuthStore((state) => state.token);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const user = useAuthStore((state) => state.user);
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
  const [submitError, setSubmitError] = useState("");
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
  const setQty = useCartStore((state) => state.setQty);
  const syncItemStock = useCartStore((state) => state.syncItemStock);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);
  async function refreshItemStock(item: (typeof items)[number]) {
    const latestProduct = await api.getProductById(item.productId ?? item.id);
    const latestVariant = item.variantId
      ? latestProduct.variants?.find(
          (variant: { id?: number }) => String(variant.id) === item.variantId,
        )
      : latestProduct.variants?.find(
          (variant: { isDefault?: boolean }) => variant.isDefault,
        );
    const latestStock = latestVariant?.stock ?? latestProduct.stock ?? 0;

    syncItemStock(String(item.id), latestStock);

    if (latestStock > 0 && item.quantity > latestStock) {
      setQty(String(item.id), latestStock);
    }
  }
  useEffect(() => {
    if (!hydrated || items.length === 0) return;

    let isMounted = true;

    async function syncCheckoutStock() {
      try {
        await Promise.all(
          items.map(async (item) => {
            try {
              await refreshItemStock(item);
            } catch {
              if (!isMounted) return;
              syncItemStock(String(item.id), 0);
            }
          }),
        );
      } catch (error) {
        console.log("Checkout stock sync error:", error);
      }
    }

    syncCheckoutStock();

    return () => {
      isMounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, items.length]);

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
          <ActivityIndicator size="large" color="#DC2626" />
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
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const invalidItems = items.filter(
    (item) => item.stock <= 0 || item.quantity > item.stock,
  );

  const hasInvalidItems = invalidItems.length > 0;
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
  const orderPayload = {
    items: items.map((item) => ({
      productId: Number(item.productId ?? item.id),
      variantId: item.variantId ? Number(item.variantId) : undefined,
      name: item.name,
      price: item.price,
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
  };
  const checkoutSnapshot = {
    fullName: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
  };
  const handlePlaceOrder = async () => {
    setSubmitError("");
    setTouched({
      fullName: true,
      phone: true,
      address: true,
    });

    if (!user || !token) {
      router.push({
        pathname: "/login",
        params: { redirectTo: "/checkout" },
      });
      return;
    }

    if (!items.length || !isFormValid || isSubmitting || hasInvalidItems)
      return;

    if (isKhaltiSelected) {
      return;
    }

    try {
      setIsSubmitting(true);

      await new Promise((resolve) => setTimeout(resolve, 400));

      const createdOrder = (await api.createOrder(
        token,
        orderPayload,
      )) as Order;

      saveCheckoutDetails(checkoutSnapshot);

      if (isEsewaSelected) {
        const paymentResult = await initiatePayment({
          orderId: String(createdOrder.id),
          amount: total,
          customerName: fullName.trim(),
          phone: phone.trim(),
          token,
          method: "esewa",
        });

        if (!paymentResult.success) {
          throw new Error(
            paymentResult.message || "Failed to initiate eSewa payment",
          );
        }

        setPaymentPayload({
          orderId: String(createdOrder.id),
          amount: total,
          customerName: fullName.trim(),
          phone: phone.trim(),
          method: "esewa",
          redirectUrl: paymentResult.redirectUrl,
          paymentId: paymentResult.paymentId,
          providerReference: paymentResult.providerReference,
        });

        router.push({
          pathname: "/payment-confirmation",
          params: {
            orderId: String(createdOrder.id),
            method: "esewa",
          },
        });
        return;
      }

      clearCart();

      router.replace({
        pathname: "/order-success",
        params: { orderId: String(createdOrder.id) },
      });
    } catch (error) {
      console.log("Checkout error:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong during checkout.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEsewaSelected = paymentMethod === "esewa";
  const isKhaltiSelected = paymentMethod === "khalti";

  const isCheckoutDisabled =
    !items.length ||
    !isFormValid ||
    isSubmitting ||
    isKhaltiSelected ||
    hasInvalidItems;
  const checkoutButtonText = !user
    ? "Login to Continue"
    : hasInvalidItems
      ? "Fix Cart to Continue"
      : isKhaltiSelected
        ? "Khalti Coming Soon"
        : isEsewaSelected
          ? "Pay with eSewa"
          : "Place Order";
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
                <Ionicons name="bag-handle-outline" size={22} color="#DC2626" />
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
              {hasInvalidItems && (
                <View style={styles.stockAlertCard}>
                  <Text style={styles.stockAlertTitle}>
                    Cart needs attention
                  </Text>
                  <Text style={styles.stockAlertText}>
                    Some items are out of stock or exceed available quantity.
                    Please review your cart before placing the order.
                  </Text>
                </View>
              )}
              {!user && (
                <View style={styles.guestNotice}>
                  <Text style={styles.guestNoticeTitle}>
                    Guest checkout preview
                  </Text>
                  <Text style={styles.guestNoticeText}>
                    You can review your order, but you’ll need to log in before
                    placing it.
                  </Text>

                  <Pressable
                    style={styles.guestNoticeBtn}
                    onPress={() => router.push("/login")}
                  >
                    <Text style={styles.guestNoticeBtnText}>
                      Login to Continue
                    </Text>
                  </Pressable>
                </View>
              )}
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
                        color={paymentMethod === "cod" ? "#DC2626" : "#6b7280"}
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
                      color="#DC2626"
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
                          paymentMethod === "esewa" ? "#DC2626" : "#6b7280"
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
                      color="#DC2626"
                    />
                  )}
                </Pressable>

                {paymentMethod === "esewa" && (
                  <Text style={styles.gatewayHintText}>
                    You’ll be redirected to eSewa to complete payment securely.
                  </Text>
                )}

                <Pressable
                  style={[
                    styles.paymentOption,
                    styles.paymentOptionDisabled,
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
                          paymentMethod === "khalti" ? "#DC2626" : "#6b7280"
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
                      color="#DC2626"
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
                  {hasInvalidItems && (
                    <View style={styles.stockIssueList}>
                      {invalidItems.map((item) => (
                        <View key={item.id} style={styles.stockIssueRow}>
                          <Text style={styles.stockIssueName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.stockIssueText}>
                            {item.stock <= 0
                              ? "Out of stock"
                              : `Only ${item.stock} available, but cart has ${item.quantity}`}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      {formatPrice(subtotal)}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery</Text>
                    <Text style={styles.summaryValue}>
                      {deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}
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
                  color="#DC2626"
                />
                <Text style={styles.footerPillText}>Trusted Checkout</Text>
              </View>
            </View>
            {submitError ? (
              <Text style={styles.submitErrorText}>{submitError}</Text>
            ) : null}
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
                  {checkoutButtonText}
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
  stockAlertCard: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },

  stockAlertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 6,
  },

  stockAlertText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7F1D1D",
  },

  stockIssueList: {
    marginTop: 12,
    gap: 10,
  },

  stockIssueRow: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 12,
  },

  stockIssueName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  stockIssueText: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "600",
  },
  flex: {
    flex: 1,
  },
  paymentOptionDisabled: {
    opacity: 0.55,
  },
  container: {
    flex: 1,
    backgroundColor: "#FEF2F2",
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gatewayHintText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: -2,
    marginBottom: 12,
    lineHeight: 18,
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
    backgroundColor: "#FEF2F2",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sectionBadgeText: {
    color: "#DC2626",
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
  submitErrorText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  inputLabel: {
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
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentOptionActive: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
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
    backgroundColor: "#FEF2F2",
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 3,
  },
  paymentTextActive: {
    color: "#DC2626",
  },
  paymentSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  summaryCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
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
    borderTopColor: "#FECACA",
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
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
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
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  footerPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  placeOrderBtn: {
    backgroundColor: "#DC2626",
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
    backgroundColor: "#FEF2F2",
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
    backgroundColor: "#DC2626",
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
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
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
    borderColor: "#FECACA",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveAddressBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
  },
  guestNotice: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  guestNoticeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7F1D1D",
    marginBottom: 6,
  },

  guestNoticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
    marginBottom: 12,
  },

  guestNoticeBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#DC2626",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  guestNoticeBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
});
