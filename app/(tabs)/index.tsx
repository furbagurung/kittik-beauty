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
  const feedTabs = ["For You", "New In", "Deals", "Bestsellers"];
  const [activeFeedTab, setActiveFeedTab] = useState("For You");
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

  const filteredProducts = products.slice(0, 8);
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
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1200&auto=format&fit=crop",
              }}
              style={styles.heroImageFull}
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroContentOverlay}>
              <Text style={styles.heroLabelAlt}>NEW EDIT</Text>
              <Text style={styles.heroTitleAlt}>
                Shop trending beauty picks
              </Text>
              <Text style={styles.heroSubtextAlt}>
                Everyday skincare, makeup and glow essentials.
              </Text>

              <Pressable
                style={styles.shopNowBtnAlt}
                onPress={scrollToProducts}
              >
                <Text style={styles.shopNowTextAlt}>Shop Now</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.promoStrip}>
            <View style={styles.promoItem}>
              <Ionicons name="car-outline" size={16} color="#7c2d12" />
              <Text style={styles.promoText}>Free Shipping</Text>
            </View>
            <View style={styles.promoDivider} />
            <View style={styles.promoItem}>
              <Ionicons name="flash-outline" size={16} color="#7c2d12" />
              <Text style={styles.promoText}>Flash Deals</Text>
            </View>
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
  promoStrip: {
    marginHorizontal: 16,
    backgroundColor: "#f7f1e4",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
  },
  promoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  promoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7c2d12",
  },
  promoDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#e7d8bd",
  },
  heroWrap: {
    height: 220,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  heroImageFull: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.26)",
  },
  heroContentOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
  },
  heroLabelAlt: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitleAlt: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 31,
    marginBottom: 8,
  },
  heroSubtextAlt: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  shopNowBtnAlt: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  shopNowTextAlt: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
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
    color: "#d96c8a",
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 14,
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
