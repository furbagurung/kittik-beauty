import ProductCard from "@/components/home/ProductCard";
import Skeleton from "@/components/ui/Skeleton";

import { api } from "@/services/api";
import { Product } from "@/types/product";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
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

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const initialCategory =
    typeof params.category === "string" && categories.includes(params.category)
      ? params.category
      : "All";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    if (
      typeof params.category === "string" &&
      categories.includes(params.category)
    ) {
      setSelectedCategory(params.category);
    } else {
      setSelectedCategory("All");
    }
  }, [params.category]);

  const loadProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const backendSort =
        sortBy === "price-low"
          ? "price_asc"
          : sortBy === "price-high"
            ? "price_desc"
            : sortBy === "top-rated"
              ? "rating_desc"
              : undefined;

      const data = await api.getProducts({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        sort: backendSort,
      });

      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.title}>All Products</Text>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProducts(true)}
            tintColor="#d96c8a"
          />
        }
        columnWrapperStyle={
          filteredProducts.length > 1 ? styles.columnWrapper : undefined
        }
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color="#9ca3af" />
              <TextInput
                placeholder="Search products..."
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {categories.map((item) => {
                const isActive = selectedCategory === item;

                return (
                  <Pressable
                    key={item}
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
              })}
            </ScrollView>

            <View style={styles.sortSection}>
              <Text style={styles.sortLabel}>Sort by</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sortList}
              >
                <Pressable
                  style={[
                    styles.sortPill,
                    sortBy === "newest" && styles.sortPillActive,
                  ]}
                  onPress={() => setSortBy("newest")}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === "newest" && styles.sortPillTextActive,
                    ]}
                  >
                    Newest
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.sortPill,
                    sortBy === "price-low" && styles.sortPillActive,
                  ]}
                  onPress={() => setSortBy("price-low")}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === "price-low" && styles.sortPillTextActive,
                    ]}
                  >
                    Price: Low to High
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.sortPill,
                    sortBy === "price-high" && styles.sortPillActive,
                  ]}
                  onPress={() => setSortBy("price-high")}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === "price-high" && styles.sortPillTextActive,
                    ]}
                  >
                    Price: High to Low
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.sortPill,
                    sortBy === "top-rated" && styles.sortPillActive,
                  ]}
                  onPress={() => setSortBy("top-rated")}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      sortBy === "top-rated" && styles.sortPillTextActive,
                    ]}
                  >
                    Top Rated
                  </Text>
                </Pressable>
              </ScrollView>
            </View>

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Browse Collection</Text>
              <Text style={styles.resultsCount}>
                {loading
                  ? "Loading..."
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}`}
              </Text>
            </View>

            {error ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorTitle}>Couldn’t load products</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {loading ? (
              <View style={styles.skeletonGrid}>
                {[1, 2, 3, 4].map((item) => (
                  <View key={item} style={styles.skeletonCard}>
                    <Skeleton height={170} radius={18} />
                    <View style={styles.skeletonCardContent}>
                      <Skeleton
                        width={70}
                        height={12}
                        style={{ marginBottom: 10 }}
                      />
                      <Skeleton
                        width="80%"
                        height={16}
                        style={{ marginBottom: 12 }}
                      />
                      <View style={styles.skeletonMetaRow}>
                        <Skeleton width={80} height={14} />
                        <Skeleton width={40} height={14} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>
                Try a different search or category.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff7f8",
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
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
  categoryList: {
    paddingBottom: 20,
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
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  emptyWrap: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
  },
  sortSection: {
    marginBottom: 18,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sortList: {
    paddingRight: 8,
  },
  sortPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  sortPillActive: {
    backgroundColor: "#111827",
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  sortPillTextActive: {
    color: "#ffffff",
  },
  loadingWrap: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6b7280",
  },
  errorWrap: {
    backgroundColor: "#fff1f2",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#9f1239",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#be123c",
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  skeletonCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
  },

  skeletonCardContent: {
    padding: 12,
  },

  skeletonMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
