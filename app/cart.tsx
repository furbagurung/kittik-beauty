import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  const cartTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="bag-outline" size={44} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Looks like you haven’t added anything yet.
            </Text>

            <Pressable
              style={styles.continueBtn}
              onPress={() => router.replace("/")}
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
                <Text style={styles.name}>{item.name}</Text>

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
          <Text style={styles.total}>Total: {formatPrice(cartTotal)}</Text>

          <Pressable
            style={styles.checkoutBtn}
            onPress={() => router.push({ pathname: "/checkout" })}
          >
            <Text style={styles.checkoutText}>Checkout</Text>
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
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
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
    borderRadius: 14,
    alignItems: "flex-start",
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  price: {
    fontSize: 13,
    color: "#6b7280",
    marginVertical: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
    fontWeight: "600",
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
    backgroundColor: "#fff7f8",
  },
  total: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  checkoutBtn: {
    backgroundColor: "#d96c8a",
    padding: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});
