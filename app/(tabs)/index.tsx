import ProductCard from "@/components/home/ProductCard";
import { api } from "@/services/api";
import { Product } from "@/types/product";

import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const categories = [
  "All",
  "Skincare",
  "Makeup",
  "Haircare",
  "Body Care",
  "Fragrance",
];

export default function HomeScreen() {
  const items = useCartStore((state) => state.items);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const data = await api.getProducts({
          category: selectedCategory === "All" ? undefined : selectedCategory,
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
  }, [selectedCategory, searchQuery]);

  const filteredProducts = products.slice(0, 4);
  const scrollToProducts = () => {
    scrollRef.current?.scrollTo({
      y: 500,
      animated: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcome}>Welcome to</Text>
              <Text style={styles.brand}>Kittik Beauty</Text>
            </View>

            <Pressable
              style={styles.cartButton}
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

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search skincare, makeup..."
              placeholderTextColor="#9ca3af"
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </Pressable>
            )}
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroLabel}>Spring Edit</Text>
              <Text style={styles.heroTitle}>Glow into your best skin</Text>
              <Text style={styles.heroSubtext}>
                Premium beauty picks curated for your daily routine.
              </Text>

              <Pressable style={styles.shopNowBtn} onPress={scrollToProducts}>
                <Text style={styles.shopNowText}>Shop Now</Text>
              </Pressable>
            </View>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop",
              }}
              style={styles.heroImage}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>

          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => {
              const isActive = selectedCategory === item;

              return (
                <Pressable
                  style={[
                    styles.categoryPill,
                    isActive && styles.categoryPillActive,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isActive && styles.categoryPillTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/products",
                  params:
                    selectedCategory !== "All"
                      ? { category: selectedCategory }
                      : {},
                })
              }
            >
              <Text style={styles.sectionLink}>See All</Text>
            </Pressable>
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
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#d96c8a",
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
    backgroundColor: "#fff7f8",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    color: "#111827",
  },
  heroCard: {
    backgroundColor: "#f9dbe4",
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
    color: "#b45372",
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
    backgroundColor: "#d96c8a",
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d96c8a",
  },
  categoryList: {
    paddingBottom: 22,
  },
  categoryPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: "#d96c8a",
  },
  categoryPillText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  categoryPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
