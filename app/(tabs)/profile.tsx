import { useOrderStore } from "@/store/orderStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const orderCount = useOrderStore((state) => state.orders.length);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person-outline" size={28} color="#d96c8a" />
          </View>

          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your orders, saved products, and future account settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/orders")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="receipt-outline" size={18} color="#111827" />
              </View>
              <View>
                <Text style={styles.menuText}>My Orders</Text>
                <Text style={styles.menuSubtext}>
                  {orderCount === 0
                    ? "No orders yet"
                    : `${orderCount} ${orderCount === 1 ? "order" : "orders"}`}
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/wishlist")}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="heart-outline" size={18} color="#111827" />
              </View>
              <View>
                <Text style={styles.menuText}>Wishlist</Text>
                <Text style={styles.menuSubtext}>
                  {wishlistCount === 0
                    ? "No saved items"
                    : `${wishlistCount} ${wishlistCount === 1 ? "item" : "items"}`}
                </Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coming Soon</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>More account features later</Text>
            <Text style={styles.infoText}>
              You can add addresses, profile details, payment methods, and order
              tracking here in the next phase.
            </Text>
          </View>
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
    padding: 20,
  },
  headerBlock: {
    marginBottom: 24,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff1f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  menuItem: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff1f5",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  menuSubtext: {
    fontSize: 12,
    color: "#6b7280",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
  },
});
