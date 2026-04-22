import { api } from "@/services/api";
import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
export default function CartScreen() {
  const hydrated = useCartStore((state) => state.hydrated);
  const items = useCartStore((state) => state.items);
  const increaseQty = useCartStore((state) => state.increaseQty);
  const decreaseQty = useCartStore((state) => state.decreaseQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalItems = useCartStore((state) => state.totalItems);
  const setQty = useCartStore((state) => state.setQty);
  const syncItemStock = useCartStore((state) => state.syncItemStock);
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  async function refreshItemStock(item: (typeof items)[number]) {
    const latestProduct = await api.getProductById(item.productId ?? item.id);
    const latestVariant = item.variantId
      ? latestProduct.variants?.find(
          (variant: { id?: number }) => String(variant.id) === item.variantId,
        )
      : latestProduct.variants?.find(
          (variant: { isDefault?: boolean }) => variant.isDefault,
        );
    const latestStock = latestVariant?.stock ?? latestProduct.stock ?? 0;

    syncItemStock(String(item.id), latestStock);

    if (
      typeof latestStock === "number" &&
      latestStock > 0 &&
      item.quantity > latestStock
    ) {
      setQty(String(item.id), latestStock);
    }
  }

  useEffect(() => {
    items.forEach((item) => {
      if (item.stock > 0 && item.quantity > item.stock) {
        setQty(item.id, item.stock);
      }
    });
  }, [items, setQty]);

  const cartTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const itemCount = totalItems();

  const invalidItems = items.filter(
    (item) => item.stock <= 0 || item.quantity > item.stock,
  );

  const isCartValid = invalidItems.length === 0;

  useEffect(() => {
    if (!hydrated || items.length === 0) return;

    let isMounted = true;

    async function syncCartWithLiveStock() {
      try {
        await Promise.all(
          items.map(async (item) => {
            try {
              await refreshItemStock(item);
            } catch {
              if (!isMounted) return;
              syncItemStock(String(item.id), 0);
            }
          }),
        );
      } catch (error) {
        console.log("Error syncing cart stock:", error);
      }
    }

    syncCartWithLiveStock();

    return () => {
      isMounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, items.length]);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Your Cart</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loaderText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.title}>Your Cart</Text>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="bag-outline" size={28} color="#DC2626" />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Looks like you haven’t added anything yet.
            </Text>

            <Pressable
              style={styles.continueBtn}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.continueBtnText}>Continue Shopping</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.cardContent}>
              <View style={styles.topRow}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.variantTitle && item.variantTitle !== "Default Title" ? (
                  <Text style={styles.variantText} numberOfLines={1}>
                    {item.variantTitle}
                  </Text>
                ) : item.selectedOptions?.length ? (
                  <Text style={styles.variantText} numberOfLines={1}>
                    {item.selectedOptions
                      .map(
                        (selection) =>
                          `${selection.optionName}: ${selection.value}`,
                      )
                      .join(" · ")}
                  </Text>
                ) : null}

                <Pressable onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>

              <Text style={styles.price}>{formatPrice(item.price)}</Text>

              <Text style={styles.subtotal}>
                Subtotal: {formatPrice(item.price * item.quantity)}
              </Text>

              {item.stock === 0 ? (
                <Text style={styles.stockErrorText}>Out of stock</Text>
              ) : item.quantity >= item.stock ? (
                <Text style={styles.stockWarningText}>
                  Only {item.stock} available
                </Text>
              ) : item.stock <= 5 ? (
                <Text style={styles.stockWarningText}>
                  Low stock: {item.stock} left
                </Text>
              ) : null}

              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyControl}
                  onPress={() => decreaseQty(item.id)}
                >
                  <Text style={styles.qtyControlText}>-</Text>
                </Pressable>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <Pressable
                  style={[
                    styles.qtyControl,
                    (item.stock <= 0 || item.quantity >= item.stock) &&
                      styles.qtyControlDisabled,
                  ]}
                  onPress={() => increaseQty(item.id)}
                  disabled={item.stock <= 0 || item.quantity >= item.stock}
                >
                  <Text style={styles.qtyControlText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <View>
              <Text style={styles.footerLabel}>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Text>
              <Text style={styles.total}>{formatPrice(cartTotal)}</Text>
            </View>

            <View style={styles.footerPill}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color="#DC2626"
              />
              <Text style={styles.footerPillText}>Saved Cart</Text>
            </View>
          </View>

          {!isCartValid && (
            <Text style={styles.cartWarningText}>
              Some items in your cart are out of stock or exceed available
              quantity.
            </Text>
          )}

          <Pressable
            style={[
              styles.checkoutBtn,
              !isCartValid && styles.checkoutBtnDisabled,
            ]}
            onPress={async () => {
              try {
                await Promise.all(
                  items.map(async (item) => {
                    try {
                      await refreshItemStock(item);
                    } catch {
                      syncItemStock(String(item.id), 0);
                    }
                  }),
                );

                const refreshedItems = useCartStore.getState().items;

                const hasInvalidItems = refreshedItems.some(
                  (item) => item.stock <= 0 || item.quantity > item.stock,
                );

                if (hasInvalidItems) {
                  return;
                }

                router.push({ pathname: "/checkout" });
              } catch (error) {
                console.log("Checkout stock sync failed:", error);
              }
            }}
            disabled={!isCartValid}
          >
            <Text style={styles.checkoutText}>
              {isCartValid ? "Proceed to Checkout" : "Fix Cart to Continue"}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stockWarningText: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "600",
    marginBottom: 10,
  },
  stockErrorText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "700",
    marginBottom: 10,
  },
  variantText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },
  qtyControlDisabled: {
    opacity: 0.4,
  },
  cartWarningText: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "600",
    marginBottom: 12,
  },
  checkoutBtnDisabled: {
    backgroundColor: "#FECACA",
  },
  container: {
    flex: 1,
    backgroundColor: "#FEF2F2",
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
    backgroundColor: "#fff",
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
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loaderText: {
    marginTop: 14,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  continueBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 18,
    alignItems: "flex-start",
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  cardContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 2,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 20,
  },
  price: {
    fontSize: 13,
    color: "#6b7280",
    marginVertical: 4,
  },
  subtotal: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 12,
  },
  qtyControl: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyControlText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 20,
  },
  qtyText: {
    minWidth: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  removeText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#FEF2F2",
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  footerLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  footerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  footerPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  checkoutBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
