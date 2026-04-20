import { CATEGORY_CARDS } from "@/constants/categories";
import HeroSlider from "@/components/home/HeroSlider";
import ProductCard from "@/components/home/ProductCard";
import { api } from "@/services/api";
import { Product } from "@/types/product";

import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function HomeScreen() {
  const items = useCartStore((state) => state.items);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const feedTabs = ["For You", "New In", "Deals", "Bestsellers"];
  const [activeFeedTab, setActiveFeedTab] = useState("For You");
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const data = await api.getProducts({
          search: searchQuery.trim() || undefined,
        });

        setProducts(data);
      } catch (error) {
        console.log("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [searchQuery]);

  const filteredProducts = products.slice(0, 8);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <Pressable style={styles.utilityIcon}>
              <Ionicons name="mail-outline" size={22} color="#111827" />
            </Pressable>

            <View style={styles.searchShell}>
              <Ionicons name="search-outline" size={18} color="#111827" />
              <TextInput
                placeholder="Search products"
                placeholderTextColor="#9ca3af"
                style={styles.searchShellInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Pressable
              style={styles.utilityIcon}
              onPress={() => router.push({ pathname: "/cart" })}
            >
              <Ionicons name="bag-outline" size={22} color="#111827" />
              {totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{totalItems}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.heroWrap}>
            <HeroSlider />
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORY_CARDS.map((category) => (
              <Pressable
                key={category.label}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.categoryCardPressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/categories",
                    params: { category: category.label },
                  })
                }
              >
                <View style={styles.categoryThumbShell}>
                  <View style={styles.categoryThumbInner}>
                    <Image
                      source={{ uri: category.image }}
                      resizeMode="cover"
                      style={styles.categoryThumbImage}
                    />
                  </View>
                </View>
                <Text style={styles.categoryCardLabel} numberOfLines={2}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.feedTabsRow}>
            {feedTabs.map((tab) => {
              const isActive = activeFeedTab === tab;

              return (
                <Pressable
                  key={tab}
                  style={[styles.feedTab, isActive && styles.feedTabActive]}
                  onPress={() => setActiveFeedTab(tab)}
                >
                  <Text
                    style={[
                      styles.feedTabText,
                      isActive && styles.feedTabTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {loading ? (
            <View style={styles.productsEmpty}>
              <Text style={styles.productsEmptyTitle}>Loading products...</Text>
            </View>
          ) : filteredProducts.length > 0 ? (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </View>
          ) : (
            <View style={styles.productsEmpty}>
              <Text style={styles.productsEmptyTitle}>No products found</Text>
              <Text style={styles.productsEmptyText}>
                Try a different search or category.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  feedTabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 18,
  },
  feedTab: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  feedTabActive: {
    backgroundColor: "#111827",
  },
  feedTabText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  feedTabTextActive: {
    color: "#ffffff",
  },
  heroWrap: {
    width: "100%",
    marginBottom: 14,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  utilityIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  searchShell: {
    flex: 1,
    height: 46,
    borderWidth: 2,
    borderColor: "#111827",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchShellInput: {
    flex: 1,
    marginLeft: 8,
    color: "#111827",
    fontSize: 15,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#DC2626",
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  container: {
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 14,
    paddingBottom: 28,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  welcome: {
    fontSize: 14,
    color: "#6b7280",
  },
  brand: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  cartButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    overflow: "hidden",
  },
  heroTextWrap: {
    width: "56%",
    zIndex: 2,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 30,
    marginBottom: 10,
  },
  heroSubtext: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 14,
  },
  shopNowBtn: {
    backgroundColor: "#DC2626",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  shopNowText: {
    color: "#fff",
    fontWeight: "600",
  },
  heroImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 150,
    height: 190,
    borderTopLeftRadius: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    rowGap: 18,
  },
  categoryCard: {
    width: "31%",
    alignItems: "center",
  },
  categoryCardPressed: {
    opacity: 0.94,
  },
  categoryThumbShell: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 28,
    backgroundColor: "#f3f1ee",
    padding: 5,
    marginBottom: 10,
  },
  categoryThumbInner: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#f6f4f1",
  },
  categoryThumbImage: {
    width: "100%",
    height: "100%",
  },
  categoryCardLabel: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
    minHeight: 36,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  productsEmpty: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  productsEmptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  productsEmptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
});
