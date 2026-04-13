import { adminClient } from "@/services/admin/adminClient";
import type {
  AdminCustomerSummary,
  AdminDashboard,
  AdminOrder,
  AdminProduct,
  AdminProductInput,
} from "@/types/admin";
import type { OrderStatus } from "@/types/order";
import { useEffect, useState } from "react";

type AdminSnapshot = {
  dashboard: AdminDashboard;
  products: AdminProduct[];
  orders: AdminOrder[];
  customers: AdminCustomerSummary[];
};

type UseAdminPanelOptions = {
  token: string | null;
  enabled: boolean;
};

async function fetchAdminSnapshot(token: string): Promise<AdminSnapshot> {
  const [dashboard, products, orders, customers] = await Promise.all([
    adminClient.getDashboard(token),
    adminClient.getProducts(token),
    adminClient.getOrders(token),
    adminClient.getCustomers(token),
  ]);

  return {
    dashboard,
    products,
    orders,
    customers,
  };
}

export function useAdminPanel({ token, enabled }: UseAdminPanelOptions) {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const applySnapshot = (snapshot: AdminSnapshot) => {
    setDashboard(snapshot.dashboard);
    setProducts(snapshot.products);
    setOrders(snapshot.orders);
    setCustomers(snapshot.customers);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadAdminSnapshot() {
      if (!token || !enabled) {
        if (isMounted) {
          setDashboard(null);
          setProducts([]);
          setOrders([]);
          setCustomers([]);
          setError("");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");

        const snapshot = await fetchAdminSnapshot(token);

        if (isMounted) {
          applySnapshot(snapshot);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load admin data",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAdminSnapshot();

    return () => {
      isMounted = false;
    };
  }, [enabled, token]);

  async function refresh() {
    if (!token || !enabled) {
      return;
    }

    try {
      setRefreshing(true);
      setError("");

      const snapshot = await fetchAdminSnapshot(token);
      applySnapshot(snapshot);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to refresh admin data",
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function saveProduct(input: AdminProductInput, productId?: number) {
    if (!token) {
      throw new Error("Not authorized");
    }

    if (productId) {
      await adminClient.updateProduct(token, productId, input);
    } else {
      await adminClient.createProduct(token, input);
    }

    const snapshot = await fetchAdminSnapshot(token);
    applySnapshot(snapshot);
  }

  async function removeProduct(productId: number) {
    if (!token) {
      throw new Error("Not authorized");
    }

    await adminClient.deleteProduct(token, productId);

    const snapshot = await fetchAdminSnapshot(token);
    applySnapshot(snapshot);
  }

  async function changeOrderStatus(orderId: number, status: OrderStatus) {
    if (!token) {
      throw new Error("Not authorized");
    }

    await adminClient.updateOrderStatus(token, orderId, status);

    const snapshot = await fetchAdminSnapshot(token);
    applySnapshot(snapshot);
  }

  return {
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
  };
}
