import { useCartStore } from "@/store/cartStore";
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
  const { items, increaseQty, decreaseQty, removeItem } = useCartStore();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Your cart is empty
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>NPR {item.price}</Text>

              <View style={styles.row}>
                <Pressable onPress={() => decreaseQty(item.id)}>
                  <Text style={styles.qtyBtn}>-</Text>
                </Pressable>

                <Text>{item.quantity}</Text>

                <Pressable onPress={() => increaseQty(item.id)}>
                  <Text style={styles.qtyBtn}>+</Text>
                </Pressable>
              </View>
            </View>

            <Pressable onPress={() => removeItem(item.id)}>
              <Text style={{ color: "red" }}>Remove</Text>
            </Pressable>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: NPR {total}</Text>

        <Pressable style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff7f8" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    padding: 16,
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  name: { fontSize: 14, fontWeight: "600" },
  price: { fontSize: 13, color: "#6b7280", marginVertical: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  total: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
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
