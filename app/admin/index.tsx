import AdminCustomerCard from "@/components/admin/customers/AdminCustomerCard";
import AdminOrderCard from "@/components/admin/orders/AdminOrderCard";
import AdminProductCard from "@/components/admin/products/AdminProductCard";
import AdminProductFormModal from "@/components/admin/products/AdminProductFormModal";
import AdminSectionTabs from "@/components/admin/shared/AdminSectionTabs";
import AdminStatCard from "@/components/admin/shared/AdminStatCard";
import {
  ADMIN_PRODUCT_CATEGORIES,
  createAdminProductFormFromProduct,
  createEmptyAdminProductForm,
} from "@/constants/admin";
import { useAdminPanel } from "@/hooks/admin/useAdminPanel";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import type {
  AdminProduct,
  AdminProductFormState,
  AdminProductInput,
  AdminSection,
} from "@/types/admin";
import type { OrderStatus } from "@/types/order";
import {
  formatAdminCurrency,
  formatAdminDate,
  getOrderStatusLabel,
} from "@/utils/adminFormatters";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const METRIC_COLORS = ["#d96c8a", "#0f766e", "#1d4ed8", "#7c3aed"];

function buildProductInput(form: AdminProductFormState): AdminProductInput {
  const name = form.name.trim();
  const image = form.image.trim();
  const category = form.category.trim();
  const price = Number(form.price);
  const rating = Number(form.rating);

  if (!name || !image || !category) {
    throw new Error("Name, image, and category are required.");
  }

  if (Number.isNaN(price) || price < 0) {
    throw new Error("Price must be a valid positive number.");
  }

  if (Number.isNaN(rating) || rating < 0 || rating > 5) {
    throw new Error("Rating must be between 0 and 5.");
  }

  return {
    name,
    image,
    category,
    price,
    rating,
  };
}

export default function AdminScreen() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [syncingSession, setSyncingSession] = useState(Boolean(token));
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [productForm, setProductForm] = useState<AdminProductFormState>(
    createEmptyAdminProductForm(),
  );
  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncCurrentUser() {
      if (!token) {
        if (isMounted) {
          setSyncingSession(false);
        }
        return;
      }

      try {
        const data = await api.getCurrentUser(token);

        if (isMounted) {
          setUser(data.user);
        }
      } catch (error) {
        console.log("Failed to sync current user for admin:", error);
      } finally {
        if (isMounted) {
          setSyncingSession(false);
        }
      }
    }

    syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [setUser, token]);

  const isAdmin = user?.role === "admin";

  const {
    dashboard,
    products,
    orders,
    customers,
    loading,
    refreshing,
    error,
    refresh,
    saveProduct,
    removeProduct,
    changeOrderStatus,
  } = useAdminPanel({
    token,
    enabled: isAdmin,
  });

  const stats = dashboard
    ? [
        {
          title: "Revenue",
          value: formatAdminCurrency(dashboard.metrics.totalRevenue),
          description: `${dashboard.metrics.totalOrders} orders processed`,
        },
        {
          title: "Customers",
          value: String(dashboard.metrics.totalCustomers),
          description: "Registered buyers in the app",
        },
        {
          title: "Products",
          value: String(dashboard.metrics.totalProducts),
          description: "Live products in the catalog",
        },
        {
          title: "Pending",
          value: String(dashboard.metrics.pendingPayments),
          description: "Orders waiting for payment",
        },
      ]
    : [];

  function resetProductEditor() {
    setEditingProduct(null);
    setProductForm(createEmptyAdminProductForm());
    setProductModalVisible(false);
  }

  function handleOpenCreateProduct() {
    setEditingProduct(null);
    setProductForm(createEmptyAdminProductForm());
    setProductModalVisible(true);
  }

  function handleOpenEditProduct(product: AdminProduct) {
    setEditingProduct(product);
    setProductForm(createAdminProductFormFromProduct(product));
    setProductModalVisible(true);
  }

  function handleCloseProductModal() {
    if (savingProduct) {
      return;
    }

    resetProductEditor();
  }

  async function handleSaveProduct() {
    try {
      setSavingProduct(true);

      const input = buildProductInput(productForm);
      await saveProduct(input, editingProduct?.id);

      resetProductEditor();
    } catch (saveError) {
      Alert.alert(
        "Product save failed",
        saveError instanceof Error
          ? saveError.message
          : "Something went wrong while saving the product.",
      );
    } finally {
      setSavingProduct(false);
    }
  }

  function handleDeleteProduct(product: AdminProduct) {
    Alert.alert(
      "Delete product?",
      `Remove "${product.name}" from the catalog?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeProduct(product.id);
            } catch (deleteError) {
              Alert.alert(
                "Delete failed",
                deleteError instanceof Error
                  ? deleteError.message
                  : "Something went wrong while deleting the product.",
              );
            }
          },
        },
      ],
    );
  }

  async function handleOrderStatusChange(orderId: number, status: OrderStatus) {
    try {
      setUpdatingOrderId(orderId);
      await changeOrderStatus(orderId, status);
    } catch (updateError) {
      Alert.alert(
        "Order update failed",
        updateError instanceof Error
          ? updateError.message
          : "Something went wrong while updating the order.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  if (syncingSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/profile");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Admin Panel</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#d96c8a" />
          <Text style={styles.centerStateTitle}>Checking admin access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/profile");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Admin Panel</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <Ionicons name="lock-closed-outline" size={28} color="#d96c8a" />
          </View>
          <Text style={styles.stateTitle}>Login required</Text>
          <Text style={styles.stateMessage}>
            Sign in with an admin-enabled account to manage catalog, orders, and
            customer data.
          </Text>
          <Pressable
            style={styles.primaryAction}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.primaryActionText}>Go to Login</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/profile");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Admin Panel</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.stateCard}>
          <View style={styles.stateIconWrap}>
            <Ionicons name="shield-outline" size={28} color="#d96c8a" />
          </View>
          <Text style={styles.stateTitle}>Admin access not enabled</Text>
          <Text style={styles.stateMessage}>
            Your current account is authenticated, but the backend did not
            recognize it as an admin account.
          </Text>
          <Text style={styles.stateHint}>
            Add your email to the server&apos;s `ADMIN_EMAILS` setting, then
            sign in again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/profile");
              }
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </Pressable>

          <Text style={styles.title}>Admin Panel</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#d96c8a" />
          <Text style={styles.centerStateTitle}>Loading admin modules...</Text>
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
              router.replace("/(tabs)/profile");
            }
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.title}>Admin Panel</Text>

        <Pressable style={styles.refreshButton} onPress={refresh}>
          <Ionicons name="refresh-outline" size={18} color="#111827" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#d96c8a"
          />
        }
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Control Center</Text>
          <Text style={styles.heroTitle}>Run the shop from one place</Text>
          <Text style={styles.heroText}>
            Review store performance, maintain the product catalog, and keep
            order operations moving.
          </Text>
        </View>

        <AdminSectionTabs value={activeSection} onChange={setActiveSection} />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Admin data couldn&apos;t load cleanly
            </Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {activeSection === "overview" ? (
          <View>
            <View style={styles.metricGrid}>
              {stats.map((stat, index) => (
                <AdminStatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  accent={METRIC_COLORS[index % METRIC_COLORS.length]}
                />
              ))}
            </View>

            <Text style={styles.sectionTitle}>Status Breakdown</Text>

            <View style={styles.statusList}>
              {dashboard?.statusBreakdown.map((statusItem) => (
                <View key={statusItem.status} style={styles.statusCard}>
                  <Text style={styles.statusCardLabel}>
                    {getOrderStatusLabel(statusItem.status)}
                  </Text>
                  <Text style={styles.statusCardCount}>{statusItem.count}</Text>
                  <Text style={styles.statusCardValue}>
                    {formatAdminCurrency(statusItem.total)}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Recent Orders</Text>

            {dashboard?.recentOrders.length ? (
              dashboard.recentOrders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  updating={false}
                  showStatusActions={false}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>No recent orders</Text>
                <Text style={styles.emptyCardText}>
                  Orders will show up here once customers start checking out.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {activeSection === "products" ? (
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Catalog</Text>
                <Text style={styles.sectionSubtitle}>
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"} in inventory
                </Text>
              </View>

              <Pressable
                style={styles.primaryActionSmall}
                onPress={handleOpenCreateProduct}
              >
                <Ionicons name="add" size={16} color="#ffffff" />
                <Text style={styles.primaryActionSmallText}>Add Product</Text>
              </Pressable>
            </View>

            {products.length ? (
              products.map((product) => (
                <AdminProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleOpenEditProduct}
                  onDelete={handleDeleteProduct}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>Catalog is empty</Text>
                <Text style={styles.emptyCardText}>
                  Add your first product to start managing inventory from the
                  admin panel.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {activeSection === "orders" ? (
          <View>
            <Text style={styles.sectionTitle}>Order Operations</Text>
            <Text style={styles.sectionSubtitle}>
              Update fulfillment status as orders move from checkout to
              delivery.
            </Text>

            {orders.length ? (
              orders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  updating={updatingOrderId === order.id}
                  onUpdateStatus={handleOrderStatusChange}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>No orders available</Text>
                <Text style={styles.emptyCardText}>
                  Once orders exist, you can update and monitor them here.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {activeSection === "customers" ? (
          <View>
            <Text style={styles.sectionTitle}>Customer Insights</Text>
            <Text style={styles.sectionSubtitle}>
              Track who is buying, how often they return, and who has admin
              access.
            </Text>

            {customers.length ? (
              customers.map((customer) => (
                <AdminCustomerCard key={customer.id} customer={customer} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardTitle}>No customers found</Text>
                <Text style={styles.emptyCardText}>
                  Customer accounts will appear here once users sign up.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteTitle}>Current admin account</Text>
          <Text style={styles.footerNoteText}>
            {user.name} | {user.email}
          </Text>
          <Text style={styles.footerNoteText}>
            Last refresh {formatAdminDate(new Date())}
          </Text>
        </View>
      </ScrollView>

      <AdminProductFormModal
        visible={productModalVisible}
        mode={editingProduct ? "edit" : "create"}
        categories={ADMIN_PRODUCT_CATEGORIES}
        form={productForm}
        saving={savingProduct}
        onChange={(field, value) =>
          setProductForm((current) => ({
            ...current,
            [field]: value,
          }))
        }
        onClose={handleCloseProductModal}
        onSubmit={handleSaveProduct}
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  heroEyebrow: {
    color: "#fbcfe8",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroText: {
    color: "#d1d5db",
    fontSize: 14,
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: "#fff1f2",
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9f1239",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#be123c",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 16,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
    marginBottom: 12,
  },
  primaryActionSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryActionSmallText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  statusList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statusCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  statusCardLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 10,
  },
  statusCardCount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  statusCardValue: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  emptyCardText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
  },
  footerNote: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginTop: 10,
  },
  footerNoteTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  footerNoteText: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  centerStateTitle: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
  },
  stateCard: {
    flex: 1,
    margin: 20,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stateIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#fff1f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
  },
  stateMessage: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  stateHint: {
    fontSize: 13,
    lineHeight: 20,
    color: "#9ca3af",
    textAlign: "center",
  },
  primaryAction: {
    backgroundColor: "#111827",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
