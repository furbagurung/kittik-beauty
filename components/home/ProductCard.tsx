import Skeleton from "@/components/ui/Skeleton";
import { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { MotiImage, MotiView } from "moti";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  const hasRating = typeof product.rating === "number";
  const isOutOfStock = (product.stock ?? 0) === 0;
  const isLowStock = (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 240 }}
      style={styles.cardWrap}
    >
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        android_ripple={{ color: "#f3f4f6" }}
        onPress={async () => {
          await Haptics.selectionAsync();

          router.push({
            pathname: "/product/[id]",
            params: { id: String(product.id) },
          });
        }}
      >
        <View style={styles.imageWrap}>
          {!imageLoaded && <Skeleton height={220} radius={0} />}

          <MotiImage
            source={{ uri: product.image }}
            style={styles.image}
            onLoad={() => setImageLoaded(true)}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ type: "timing", duration: 220 }}
          />

          {!!product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText} numberOfLines={1}>
                {product.category}
              </Text>
            </View>
          )}

          <View style={styles.heartButton}>
            <Ionicons name="heart-outline" size={16} color="#111827" />
          </View>

          {isOutOfStock ? (
            <View style={styles.stockBadgeOut}>
              <Text style={styles.stockBadgeOutText}>Out of stock</Text>
            </View>
          ) : isLowStock ? (
            <View style={styles.stockBadgeLow}>
              <Text style={styles.stockBadgeLowText}>
                Only {product.stock} left
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>

          <View style={styles.metaRow}>
            {hasRating ? (
              <View style={styles.ratingWrap}>
                <Ionicons name="star" size={12} color="#f59e0b" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
            ) : (
              <View />
            )}

            <View style={styles.quickBagButton}>
              <Ionicons name="bag-add-outline" size={16} color="#111827" />
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: "48.5%",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: "100%",
    height: 220,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: 220,
    backgroundColor: "#f3f4f6",
  },
  categoryBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: "62%",
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
  },
  heartButton: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  stockBadgeOut: {
    position: "absolute",
    left: 8,
    bottom: 8,
    backgroundColor: "rgba(17,24,39,0.88)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stockBadgeOutText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  stockBadgeLow: {
    position: "absolute",
    left: 8,
    bottom: 8,
    backgroundColor: "rgba(255,255,255,0.94)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stockBadgeLowText: {
    color: "#b45309",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111827",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
  },
  quickBagButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
});
