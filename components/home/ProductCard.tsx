import { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/product/[id]", params: { id: product.id } })
      }
    >
      <Image source={{ uri: product.image }} style={styles.image} />

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
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
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
});
