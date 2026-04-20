import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { getPaymentLabel } from "@/utils/payment";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function OrderDetailsScreen() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "Pending Payment";
      case "paid":
        return "Paid";
      case "placed":
        return "Placed";
      case "processing":
        return "Processing";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "payment_failed":
        return "Payment Failed";
      default:
        return status;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending_payment":
        return styles.statusBadgePending;
      case "paid":
        return styles.statusBadgePaid;
      case "delivered":
        return styles.statusBadgeDelivered;
      case "cancelled":
        return styles.statusBadgeCancelled;
      case "payment_failed":
        return styles.statusBadgeFailed;
      default:
        return styles.statusBadge;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case "pending_payment":
        return styles.statusTextPending;
      case "paid":
        return styles.statusTextPaid;
      case "delivered":
        return styles.statusTextDelivered;
      case "cancelled":
        return styles.statusTextCancelled;
      case "payment_failed":
        return styles.statusTextFailed;
      default:
        return styles.statusText;
    }
  };
  const canCancelOrder =
    order?.status === "placed" || order?.status === "pending_payment";
  const loadOrder = useCallback(async () => {
    if (!id || !token) return;

    try {
      setLoading(true);
      const data = await api.getOrderById(token, id);
      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [id, token]);
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadOrder();
  }, [user, loadOrder]);
  const handleCancelOrder = () => {
    if (!order || !token || !canCancelOrder || isCancelling) return;

    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "Keep Order", style: "cancel" },
      {
        text: "Cancel Order",
        style: "destructive",
        onPress: async () => {
          try {
            setIsCancelling(true);
            const updatedOrder = await api.cancelOwnOrder(token, order.id);
            setOrder(updatedOrder);
          } catch (error) {
            Alert.alert(
              "Unable to cancel",
              error instanceof Error
                ? error.message
                : "Failed to cancel order.",
            );
          } finally {
            setIsCancelling(false);
          }
        },
      },
    ]);
  };
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Order Details</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="lock-closed-outline" size={28} color="#DC2626" />
          </View>

          <Text style={styles.emptyTitle}>Login required</Text>
          <Text style={styles.emptySubtext}>
            Please log in to view your order details.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.primaryButtonText}>Login to Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Order Details</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <Text style={styles.emptySubtext}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Order Details</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="receipt-outline" size={28} color="#DC2626" />
          </View>
          <Text style={styles.emptyTitle}>Order not found</Text>
          <Text style={styles.emptySubtext}>
            This order may no longer be available.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/orders")}
          >
            <Text style={styles.primaryButtonText}>Back to Orders</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.title}>Order Details</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <View style={styles.orderTop}>
            <View>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <Text style={styles.orderDate}>
                {formatDate(order.createdAt)}
              </Text>
            </View>

            <View
              style={[styles.statusBadge, getStatusBadgeStyle(order.status)]}
            >
              <Text
                style={[styles.statusText, getStatusTextStyle(order.status)]}
              >
                {getStatusLabel(order.status)}
              </Text>
            </View>
          </View>

          {canCancelOrder && (
            <Pressable
              style={[
                styles.cancelOrderButton,
                isCancelling && styles.cancelOrderButtonDisabled,
              ]}
              onPress={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color="#dc2626" />
              ) : (
                <Text style={styles.cancelOrderButtonText}>Cancel Order</Text>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{order.fullName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{order.phone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={[styles.infoValue, styles.addressValue]}>
              {order.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {getPaymentLabel(order.paymentMethod)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>

          {order.items.map((item: any) => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productImage} />

              <View style={styles.productContent}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>

                <Text style={styles.productMeta}>
                  Qty: {item.quantity} × {formatPrice(item.price)}
                </Text>

                <Text style={styles.productTotal}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{order.totalItems}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(order.subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "Free"}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statusBadgeCancelled: {
    backgroundColor: "#fef2f2",
  },
  statusTextCancelled: {
    color: "#dc2626",
  },
  statusBadgeFailed: {
    backgroundColor: "#fff7ed",
  },
  statusTextFailed: {
    color: "#991B1B",
  },
  cancelOrderButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },

  cancelOrderButtonDisabled: {
    opacity: 0.6,
  },

  cancelOrderButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "700",
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
    paddingBottom: 24,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  statusBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  addressValue: {
    lineHeight: 20,
  },
  productCard: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 10,
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginRight: 12,
  },
  productContent: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    lineHeight: 20,
  },
  productMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
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
    fontWeight: "600",
    color: "#111827",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#FECACA",
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
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  statusBadgePending: {
    backgroundColor: "#fff7ed",
  },
  statusTextPending: {
    color: "#991B1B",
  },
  statusBadgePaid: {
    backgroundColor: "#ecfdf5",
  },
  statusTextPaid: {
    color: "#047857",
  },
  statusBadgeDelivered: {
    backgroundColor: "#eff6ff",
  },
  statusTextDelivered: {
    color: "#1d4ed8",
  },
});
