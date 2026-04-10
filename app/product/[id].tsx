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

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return PRODUCTS.filter(
      (item) => item.id !== product.id && item.category === product.category,
    ).slice(0, 4);
  }, [product]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

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

    router.push("/cart");
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
              onPress={() => router.push("/cart")}
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

          <View style={styles.imageBottomOverlay}>
            <View style={styles.overlayPill}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.overlayPillText}>{product.rating}</Text>
            </View>

            <View style={styles.overlayPill}>
              <Text style={styles.overlayPillText}>In Stock</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          <View style={styles.infoChipsRow}>
            <View style={styles.infoChip}>
              <Ionicons name="leaf-outline" size={14} color="#d96c8a" />
              <Text style={styles.infoChipText}>Skin Friendly</Text>
            </View>

            <View style={styles.infoChip}>
              <Ionicons name="sparkles-outline" size={14} color="#d96c8a" />
              <Text style={styles.infoChipText}>Daily Use</Text>
            </View>

            <View style={styles.infoChip}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#d96c8a"
              />
              <Text style={styles.infoChipText}>Premium Care</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              A premium beauty essential crafted for everyday confidence, smooth
              application, and a polished self-care routine. Designed to feel
              lightweight, comfortable, and elegant in your daily regimen.
            </Text>
          </View>
          {/* why you'll love it  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Why you’ll love it</Text>

            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#d96c8a" />
              <Text style={styles.benefitText}>
                Lightweight feel for comfortable everyday wear
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#d96c8a" />
              <Text style={styles.benefitText}>
                Premium finish with a polished beauty look
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color="#d96c8a" />
              <Text style={styles.benefitText}>
                Curated for a soft, modern self-care routine
              </Text>
            </View>
          </View>
          {/* how to use section  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>How to use</Text>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Start with clean, dry skin before applying the product.
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Apply gently in small amounts and blend evenly for a natural
                finish.
              </Text>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Use daily or as needed as part of your regular beauty routine.
              </Text>
            </View>
          </View>
          {/* quantity selector and related products card  */}
          <View style={styles.sectionCard}>
            <View style={styles.quantityHeader}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <Text style={styles.quantityHint}>Adjust before checkout</Text>
            </View>

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
          {/* Key Highlights Section  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Key highlights</Text>

            <View style={styles.highlightsGrid}>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Finish</Text>
                <Text style={styles.highlightValue}>Smooth</Text>
              </View>

              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Routine</Text>
                <Text style={styles.highlightValue}>Daily Care</Text>
              </View>

              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Texture</Text>
                <Text style={styles.highlightValue}>Lightweight</Text>
              </View>

              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Skin Feel</Text>
                <Text style={styles.highlightValue}>Comfortable</Text>
              </View>
            </View>
          </View>
          {/* Review Summary Section  */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Review summary</Text>

            <View style={styles.reviewTopRow}>
              <View style={styles.reviewScoreWrap}>
                <Text style={styles.reviewScore}>{product.rating}</Text>
                <View style={styles.reviewStarsRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Ionicons name="star" size={14} color="#f59e0b" />
                </View>
              </View>

              <View style={styles.reviewTextWrap}>
                <Text style={styles.reviewTitle}>Loved by daily users</Text>
                <Text style={styles.reviewText}>
                  Customers appreciate the smooth feel, elegant finish, and easy
                  everyday use.
                </Text>
              </View>
            </View>
          </View>
          {/* show cart added message  */}
          {showAddedMessage && (
            <View style={styles.addedMessageWrap}>
              <Text style={styles.addedMessageText}>
                Added to cart successfully.
              </Text>

              <Pressable onPress={() => router.push("/cart")}>
                <Text style={styles.viewCartText}>View Cart</Text>
              </Pressable>
            </View>
          )}

          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <View style={styles.relatedHeader}>
                <Text style={styles.relatedTitle}>You may also like</Text>
                <Text style={styles.relatedSubtitle}>
                  More picks from {product.category}
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedList}
              >
                {relatedProducts.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.relatedCard}
                    onPress={() =>
                      router.push({
                        pathname: "/product/[id]",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.relatedImage}
                    />

                    <View style={styles.relatedCardContent}>
                      <Text style={styles.relatedCategory}>
                        {item.category}
                      </Text>

                      <Text style={styles.relatedName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <View style={styles.relatedMetaRow}>
                        <Text style={styles.relatedPrice}>
                          {formatPrice(item.price)}
                        </Text>

                        <View style={styles.relatedRatingWrap}>
                          <Ionicons name="star" size={12} color="#f59e0b" />
                          <Text style={styles.relatedRatingText}>
                            {item.rating}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerAmount}>
            {formatPrice(product.price * qty)}
          </Text>
        </View>

        <View style={styles.footerActions}>
          <Pressable style={styles.buyNowBtn} onPress={handleBuyNow}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </Pressable>

          <Pressable style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>
              {isAdded ? "Added" : "Add to Cart"}
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
  scrollContent: {
    paddingBottom: 140,
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
  imageBottomOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    gap: 10,
  },
  overlayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  overlayPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  content: {
    padding: 20,
  },
  category: {
    fontSize: 13,
    color: "#d96c8a",
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 34,
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 18,
  },
  infoChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  infoChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
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
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: "#374151",
  },
  quantityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityHint: {
    fontSize: 12,
    color: "#6b7280",
  },
  quantityBox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#fff7f8",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
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
  addedMessageWrap: {
    marginTop: -2,
    marginBottom: 6,
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
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fffafb",
    borderTopWidth: 1,
    borderTopColor: "#f1e5e8",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  footerLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  footerActions: {
    flexDirection: "row",
    gap: 10,
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#f0d7df",
  },
  buyNowText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: "#d96c8a",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 15,
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
  relatedSection: {
    marginTop: 4,
  },
  relatedHeader: {
    marginBottom: 14,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  relatedSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  relatedList: {
    paddingRight: 8,
  },
  relatedCard: {
    width: 220,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    marginRight: 14,
    overflow: "hidden",
  },
  relatedImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f3f4f6",
  },
  relatedCardContent: {
    padding: 12,
  },
  relatedCategory: {
    fontSize: 11,
    color: "#d96c8a",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  relatedName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 20,
    marginBottom: 10,
    minHeight: 40,
  },
  relatedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  relatedRatingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff7f0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  relatedRatingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400e",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff1f5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#d96c8a",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  highlightItem: {
    width: "47%",
    backgroundColor: "#fff7f8",
    borderRadius: 14,
    padding: 12,
  },
  highlightLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  reviewTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  reviewScoreWrap: {
    width: 76,
    backgroundColor: "#fff7f0",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  reviewScore: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  reviewStarsRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewTextWrap: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
});
