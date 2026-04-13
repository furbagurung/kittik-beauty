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
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 280 }}
      style={styles.cardWrap}
    >
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        android_ripple={{ color: "#f3e8ee" }}
        onPress={async () => {
          await Haptics.selectionAsync();

          router.push({
            pathname: "/product/[id]",
            params: { id: String(product.id) },
          });
        }}
      >
        <View style={styles.imageWrap}>
          {!imageLoaded && <Skeleton height={170} radius={0} />}

          <MotiImage
            source={{ uri: product.image }}
            style={styles.image}
            onLoad={() => setImageLoaded(true)}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ type: "timing", duration: 250 }}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.row}>
            <Text style={styles.price}>NPR {product.price}</Text>

            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.rating}>{product.rating}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: "48%",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.9,
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  rating: {
    fontSize: 13,
    color: "#6b7280",
  },
  imageWrap: {
    width: "100%",
    height: 170,
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
});
