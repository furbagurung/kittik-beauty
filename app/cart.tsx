import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CartScreen() {
  const hydrated = useCartStore((state) => state.hydrated);
  const items = useCartStore((state) => state.items);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalItems = useCartStore((state) => state.totalItems);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  if (!hydrated) {
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

          <Text style={styles.title}>Your Cart</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#d96c8a" />
          <Text style={styles.loaderText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cartTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const itemCount = totalItems();

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

        <Text style={styles.title}>Your Cart</Text>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="bag-outline" size={28} color="#d96c8a" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Looks like you haven’t added anything yet.
            </Text>

            <Pressable
              style={styles.continueBtn}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.continueBtnText}>Continue Shopping</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>

                <Pressable onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>

              <Text style={styles.price}>{formatPrice(item.price)}</Text>

              <Text style={styles.subtotal}>
                Subtotal: {formatPrice(item.price * item.quantity)}
              </Text>

              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyControl}
                  onPress={() => decreaseQty(item.id)}
                >
                  <Text style={styles.qtyControlText}>-</Text>
                </Pressable>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <Pressable
                  style={styles.qtyControl}
                  onPress={() => increaseQty(item.id)}
                >
                  <Text style={styles.qtyControlText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <View>
              <Text style={styles.footerLabel}>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
              <Text style={styles.total}>{formatPrice(cartTotal)}</Text>
            </View>

            <View style={styles.footerPill}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#d96c8a"
              />
              <Text style={styles.footerPillText}>Saved Cart</Text>
            </View>
          </View>

          <Pressable
            style={styles.checkoutBtn}
            onPress={() => router.push({ pathname: "/checkout" })}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </Pressable>
        </View>
      )}
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 56,
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
  continueBtn: {
    backgroundColor: "#d96c8a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 18,
    alignItems: "flex-start",
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  cardContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 2,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 20,
  },
  price: {
    fontSize: 13,
    color: "#6b7280",
    marginVertical: 4,
  },
  subtotal: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 12,
  },
  qtyControl: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyControlText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 20,
  },
  qtyText: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  removeText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
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
  total: {
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
  checkoutBtn: {
    backgroundColor: "#d96c8a",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
