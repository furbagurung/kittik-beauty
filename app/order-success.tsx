import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function OrderSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Order Confirmed</Text>
        </View>

        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons name="checkmark" size={34} color="#ffffff" />
          </View>
        </View>

        <Text style={styles.title}>Your order is on the way</Text>

        <Text style={styles.subtitle}>
          Thank you for shopping with Kittik Beauty. Your order has been placed
          successfully and is now being prepared.
        </Text>

        {orderId ? (
          <View style={styles.orderPill}>
            <Text style={styles.orderPillLabel}>Order ID</Text>
            <Text style={styles.orderPillValue}>{orderId}</Text>
          </View>
        ) : null}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="bag-handle-outline" size={18} color="#d96c8a" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>Order received</Text>
              <Text style={styles.infoText}>
                We’ve received your order and started processing it.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="car-outline" size={18} color="#d96c8a" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>Delivery update</Text>
              <Text style={styles.infoText}>
                Delivery details and tracking can be connected here later.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#d96c8a"
              />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>Secure checkout</Text>
              <Text style={styles.infoText}>
                Your checkout flow was completed successfully.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {orderId ? (
            <Pressable
              style={styles.primaryBtn}
              onPress={() =>
                router.replace({
                  pathname: "/order/[id]",
                  params: { id: orderId },
                })
              }
            >
              <Text style={styles.primaryBtnText}>Track This Order</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={orderId ? styles.secondaryBtn : styles.primaryBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text
              style={orderId ? styles.secondaryBtnText : styles.primaryBtnText}
            >
              Continue Shopping
            </Text>
          </Pressable>

          <Pressable
            style={orderId ? styles.secondaryBtn : styles.primaryBtn}
            onPress={() => router.replace("/orders")}
          >
            <Text
              style={orderId ? styles.secondaryBtnText : styles.primaryBtnText}
            >
              View Orders
            </Text>
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
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
    letterSpacing: 0.2,
  },
  iconOuter: {
    alignSelf: "center",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fde7ee",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  iconInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#d96c8a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#d96c8a",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  orderPill: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#f0d7df",
  },
  orderPillLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  orderPillValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff1f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3e4e8",
    marginVertical: 14,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#d96c8a",
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
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
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
});
