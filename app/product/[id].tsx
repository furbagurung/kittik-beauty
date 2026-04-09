import { PRODUCTS } from "@/constants/mockData";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const addToCart = useCartStore((state) => state.addToCart);
  const items = useCartStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);
  const [qty, setQty] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const product = useMemo(
    () => PRODUCTS.find((item) => item.id === String(id)),
    [id],
  );
  const liked = product
    ? wishlistItems.some((item) => item.id === product.id)
    : false;
  useEffect(() => {
    if (!showAddedMessage) return;

    const timer = setTimeout(() => {
      setShowAddedMessage(false);
      setIsAdded(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, [showAddedMessage]);
  const handleDecreaseQty = () => {
    setQty((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQty = () => {
    setQty((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
    });

    setIsAdded(true);
    setShowAddedMessage(true);
  };
  const handleBuyNow = () => {
    if (!product) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: qty,
    });

    router.push({ pathname: "/cart" });
  };
  const handleToggleWishlist = () => {
    if (!product) return;

    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
    });
  };
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundText}>Product not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.image }} style={styles.image} />

          <Pressable
            style={[styles.iconButton, styles.backButton]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.smallIconButton}
              onPress={handleToggleWishlist}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? "#d96c8a" : "#111827"}
              />
            </Pressable>
            <Pressable
              style={styles.smallIconButton}
              onPress={() => router.push({ pathname: "/cart" })}
            >
              <Ionicons name="bag-outline" size={20} color="#111827" />

              {totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.stockText}>In Stock</Text>
          </View>

          <Text style={styles.price}>
            {new Intl.NumberFormat("en-NP", {
              style: "currency",
              currency: "NPR",
              maximumFractionDigits: 0,
            }).format(product.price)}
          </Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            A premium beauty essential crafted for everyday confidence, smooth
            application, and a polished self-care routine.
          </Text>

          <View style={styles.quantityWrap}>
            <Text style={styles.sectionTitle}>Quantity</Text>

            <View style={styles.quantityBox}>
              <Pressable style={styles.qtyBtn} onPress={handleDecreaseQty}>
                <Text style={styles.qtyBtnText}>-</Text>
              </Pressable>

              <Text style={styles.qtyValue}>{qty}</Text>

              <Pressable style={styles.qtyBtn} onPress={handleIncreaseQty}>
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>
              {isAdded ? "Added" : "Add to Cart"}
            </Text>
          </Pressable>
          {showAddedMessage && (
            <View style={styles.addedMessageWrap}>
              <Text style={styles.addedMessageText}>
                Added to cart successfully.
              </Text>

              <Pressable onPress={() => router.push({ pathname: "/cart" })}>
                <Text style={styles.viewCartText}>View Cart</Text>
              </Pressable>
            </View>
          )}
          <Pressable style={styles.buyNowBtn} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f8",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  imageWrap: {
    position: "relative",
    height: 420,
    backgroundColor: "#ffffff",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconButton: {
    position: "absolute",
    top: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    left: 16,
  },
  headerActions: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  smallIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 999,
    backgroundColor: "#d96c8a",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 13,
    color: "#d96c8a",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 34,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  dot: {
    marginHorizontal: 8,
    color: "#9ca3af",
  },
  stockText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4b5563",
    marginBottom: 24,
  },
  quantityWrap: {
    marginBottom: 24,
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: -2,
  },
  qtyValue: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  addToCartBtn: {
    backgroundColor: "#d96c8a",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 12,
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buyNowBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#f0d7df",
  },
  buyNowText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  notFoundWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    fontSize: 16,
    color: "#6b7280",
  },
  addedMessageWrap: {
    marginTop: -2,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  addedMessageText: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "600",
  },
  viewCartText: {
    fontSize: 14,
    color: "#d96c8a",
    fontWeight: "700",
  },
});
