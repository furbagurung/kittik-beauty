import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  CATEGORY_CARDS,
  ShoppingCategory,
  getCategoryMeta,
  isShoppingCategory,
} from "@/constants/categories";

export default function CategoriesScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const requestedCategory =
    typeof params.category === "string" ? params.category : undefined;
  const initialCategory =
    requestedCategory && isShoppingCategory(requestedCategory)
      ? requestedCategory
      : CATEGORY_CARDS[0].label;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<ShoppingCategory>(initialCategory);

  useEffect(() => {
    if (requestedCategory && isShoppingCategory(requestedCategory)) {
      setActiveCategory(requestedCategory);
      return;
    }

    setActiveCategory(CATEGORY_CARDS[0].label);
  }, [requestedCategory]);

  const visibleCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return CATEGORY_CARDS;
    }

    return CATEGORY_CARDS.filter((category) => {
      const values = [
        category.label,
        category.subtitle,
        category.description,
      ];

      return values.some((value) => value.toLowerCase().includes(query));
    });
  }, [searchQuery]);

  const activeCategoryMeta =
    getCategoryMeta(activeCategory) ?? CATEGORY_CARDS[0];

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.utilityIcon}>
            <Ionicons name="grid-outline" size={22} color="#111827" />
          </View>

          <View style={styles.searchShell}>
            <Ionicons name="search-outline" size={18} color="#111827" />
            <TextInput
              placeholder="Search categories"
              placeholderTextColor="#9ca3af"
              style={styles.searchShellInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.utilityIcon}>
            <Ionicons name="options-outline" size={22} color="#111827" />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Categories</Text>
            <Text style={styles.subtitle}>
              Explore curated beauty sections and jump straight into the
              products you want.
            </Text>

            <View style={styles.heroCard}>
              <ImageBackground
                source={{ uri: activeCategoryMeta.image }}
                style={styles.heroImage}
                imageStyle={styles.heroImage}
              >
                <LinearGradient
                  colors={activeCategoryMeta.gradient}
                  style={styles.heroOverlay}
                >
                  <View style={styles.heroBadge}>
                    <View
                      style={[
                        styles.heroBadgeDot,
                        { backgroundColor: activeCategoryMeta.accentColor },
                      ]}
                    />
                    <Text style={styles.heroBadgeText}>Selected category</Text>
                  </View>

                  <View style={styles.heroBody}>
                    <Text style={styles.heroTitle}>
                      {activeCategoryMeta.label}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                      {activeCategoryMeta.subtitle}
                    </Text>
                    <Text style={styles.heroDescription}>
                      {activeCategoryMeta.description}
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.heroCta,
                      pressed && styles.heroCtaPressed,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/products",
                        params: { category: activeCategoryMeta.label },
                      })
                    }
                  >
                    <Text style={styles.heroCtaText}>
                      Browse {activeCategoryMeta.label}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#111827"
                    />
                  </Pressable>
                </LinearGradient>
              </ImageBackground>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse categories</Text>
              <Text style={styles.sectionCaption}>
                {CATEGORY_CARDS.length} sections
              </Text>
            </View>

            <View style={styles.categoryGrid}>
              {visibleCategories.map((category) => {
                const isActive = category.label === activeCategory;

                return (
                  <Pressable
                    key={category.label}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.categoryTile,
                      isActive && styles.categoryTileActive,
                      pressed && styles.categoryTilePressed,
                    ]}
                    onPress={() => setActiveCategory(category.label)}
                  >
                    <View
                      style={[
                        styles.categoryThumbShell,
                        isActive && styles.categoryThumbShellActive,
                      ]}
                    >
                      <View style={styles.categoryThumbInner}>
                        <Image
                          source={{ uri: category.image }}
                          resizeMode="cover"
                          style={styles.categoryThumbImage}
                        />
                      </View>
                    </View>
                    <Text style={styles.categoryTileLabel} numberOfLines={2}>
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {visibleCategories.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No categories found</Text>
                <Text style={styles.emptyStateText}>
                  Try a different search term.
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: (StatusBar.currentHeight ?? 0) + 8,
    paddingBottom: 14,
  },
  utilityIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchShell: {
    flex: 1,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchShellInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCard: {
    marginTop: 20,
    borderRadius: 24,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: 320,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },
  heroBody: {
    gap: 8,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    fontWeight: "700",
  },
  heroDescription: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "88%",
  },
  heroCta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  heroCtaPressed: {
    opacity: 0.94,
  },
  heroCtaText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  sectionCaption: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },
  categoryTile: {
    width: "31%",
    alignItems: "center",
  },
  categoryTileActive: {
    backgroundColor: "transparent",
  },
  categoryTilePressed: {
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
  categoryThumbShellActive: {
    backgroundColor: "#ede9fe",
    borderWidth: 2,
    borderColor: "#111827",
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
  categoryTileLabel: {
    color: "#111827",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
    minHeight: 36,
  },
  emptyState: {
    backgroundColor: "#f9fafb",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginTop: 18,
  },
  emptyStateTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyStateText: {
    color: "#6b7280",
    fontSize: 13,
  },
});
