import { PRODUCTS } from "@/constants/mockData";
import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
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
  const [qty, setQty] = useState(1);

  const product = useMemo(
    () => PRODUCTS.find((item) => item.id === String(id)),
    [id],
  );

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

    Alert.alert("Added to cart", `${product.name} added to cart.`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart" as const);
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

          <Pressable style={[styles.iconButton, styles.wishlistButton]}>
            <Ionicons name="heart-outline" size={20} color="#111827" />
          </Pressable>
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
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>

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
  wishlistButton: {
    right: 16,
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
});
