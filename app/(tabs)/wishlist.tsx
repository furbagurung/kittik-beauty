import { useWishlistStore } from "@/store/wishlistStore";
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

export default function WishlistScreen() {
  const hydrated = useWishlistStore((state) => state.hydrated);
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

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Wishlist</Text>

          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color="#d96c8a" />
            <Text style={styles.loaderText}>Loading your wishlist...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Wishlist</Text>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>
              {items.length} {items.length === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>

        <FlatList
          data={items}
          extraData={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="heart-outline" size={28} color="#d96c8a" />
              </View>

              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptySubtext}>
                Save your favorite beauty picks here so you can find them
                quickly later.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.emptyButtonText}>Explore Products</Text>
              </Pressable>
            </View>
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

                  <View style={styles.metaRow}>
                    <Text style={styles.price}>{formatPrice(item.price)}</Text>

                    <View style={styles.ratingWrap}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>

              <Pressable
                style={styles.removeButton}
                onPress={() => removeFromWishlist(item.id)}
              >
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  countPill: {
    backgroundColor: "#fff1f5",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d96c8a",
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
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
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
    textAlign: "center",
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
    fontSize: 11,
    color: "#d96c8a",
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff7f0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  removeButton: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  removeText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
});
