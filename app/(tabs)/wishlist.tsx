import { useWishlistStore } from "@/store/wishlistStore";
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

export default function WishlistScreen() {
  const items = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Wishlist ({items.length})</Text>

        <FlatList
          data={items}
          extraData={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.cardMain}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <Image source={{ uri: item.image }} style={styles.image} />

                <View style={styles.cardContent}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>{formatPrice(item.price)}</Text>
                </View>
              </Pressable>

              <Pressable onPress={() => removeFromWishlist(item.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  cardMain: {
    flexDirection: "row",
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
    justifyContent: "center",
  },
  category: {
    fontSize: 12,
    color: "#d96c8a",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  removeText: {
    marginTop: 10,
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
});
