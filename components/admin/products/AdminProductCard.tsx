import type { AdminProduct } from "@/types/admin";
import { formatAdminCurrency } from "@/utils/adminFormatters";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AdminProductCardProps = {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
};

export default function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: AdminProductCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            contentFit="cover"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>{formatAdminCurrency(product.price)}</Text>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={() => onEdit(product)}>
          <Ionicons name="create-outline" size={16} color="#111827" />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={() => onDelete(product)}>
          <Ionicons name="trash-outline" size={16} color="#dc2626" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    gap: 14,
  },
  imageWrap: {
    width: 82,
    height: 82,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
  },
  category: {
    fontSize: 11,
    fontWeight: "700",
    color: "#d96c8a",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  editButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  editButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#fff1f2",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  deleteButtonText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "700",
  },
});
