import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { getPaymentLabel } from "@/utils/payment";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function OrdersScreen() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

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

  const loadOrders = useCallback(
    async (isRefresh = false) => {
      if (!token) return;

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await api.getOrders(token);
        setOrders(data);
      } catch (err) {
        setError("Failed to load orders");
        console.log(err);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [token],
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadOrders();
  }, [user, loadOrders]);

  const handleRefresh = () => {
    loadOrders(true);
  };
  useFocusEffect(
    useCallback(() => {
      if (!user || !token) return;

      loadOrders(true);
    }, [user, token, loadOrders]),
  );
  if (!user) {
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

          <Text style={styles.title}>My Orders</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="lock-closed-outline" size={28} color="#d96c8a" />
          </View>

          <Text style={styles.emptyTitle}>Login required</Text>
          <Text style={styles.emptySubtext}>
            Please log in to view your orders and track your purchases.
          </Text>

          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.emptyButtonText}>Login to Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  if (loading) {
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

          <Text style={styles.title}>My Orders</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#d96c8a" />
          <Text style={styles.loaderText}>Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }
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

        <Text style={styles.title}>My Orders</Text>

        <View style={styles.headerSpacer} />
      </View>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={[
          styles.listContent,
          orders.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="receipt-outline" size={28} color="#d96c8a" />
            </View>

            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Once you place an order, it will appear here.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.emptyButtonText}>Start Shopping</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/order/[id]",
                params: { id: String(item.id) },
              })
            }
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <Text style={styles.orderDate}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>

              <View
                style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}
              >
                <Text
                  style={[styles.statusText, getStatusTextStyle(item.status)]}
                >
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.productPreview}>
              <Text style={styles.productPreviewLabel}>Order Preview</Text>
              <Text style={styles.productPreviewText} numberOfLines={1}>
                {item.items[0]?.name}
                {item.items.length > 1 ? ` +${item.items.length - 1} more` : ""}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Items</Text>
              <Text style={styles.value}>{item.totalItems}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Payment</Text>
              <Text style={styles.value}>
                {getPaymentLabel(item.paymentMethod)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Delivery</Text>
              <Text style={styles.value}>
                {item.deliveryFee > 0 ? formatPrice(item.deliveryFee) : "Free"}
              </Text>
            </View>

            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
            </View>
          </Pressable>
        )}
      />
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
    color: "#c2410c",
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
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
    backgroundColor: "#fff1f5",
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
  emptyButton: {
    backgroundColor: "#d96c8a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  statusBadge: {
    backgroundColor: "#fff1f5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    color: "#d96c8a",
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3e4e8",
    marginVertical: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
  },
  value: {
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
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  productPreview: {
    marginBottom: 12,
  },
  productPreviewLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  productPreviewText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  statusBadgePending: {
    backgroundColor: "#fff7ed",
  },
  statusTextPending: {
    color: "#c2410c",
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
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff1f2",
    borderRadius: 14,
    padding: 12,
  },

  errorText: {
    color: "#be123c",
    fontSize: 13,
    fontWeight: "600",
  },
});
