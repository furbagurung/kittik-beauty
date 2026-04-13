import AdminStatusChip from "@/components/admin/shared/AdminStatusChip";
import { ADMIN_ORDER_STATUSES } from "@/constants/admin";
import type { AdminOrder } from "@/types/admin";
import type { OrderStatus } from "@/types/order";
import {
  formatAdminCurrency,
  formatAdminDate,
  getOrderStatusLabel,
} from "@/utils/adminFormatters";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AdminOrderCardProps = {
  order: AdminOrder;
  updating: boolean;
  showStatusActions?: boolean;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => void;
};

export default function AdminOrderCard({
  order,
  updating,
  showStatusActions = true,
  onUpdateStatus,
}: AdminOrderCardProps) {
  const itemPreview = order.items
    .slice(0, 2)
    .map((item) => item.name)
    .join(", ");

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.customerName}>{order.fullName}</Text>
          <Text style={styles.customerMeta}>
            {order.user.email} | {formatAdminDate(order.createdAt)}
          </Text>
        </View>

        <AdminStatusChip status={order.status} />
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>Items</Text>
          <Text style={styles.value}>
            {itemPreview || "No items"}
            {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{order.phone}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{order.paymentMethod.toUpperCase()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>{formatAdminCurrency(order.total)}</Text>
        </View>
      </View>

      {showStatusActions && onUpdateStatus ? (
        <View style={styles.actionsWrap}>
          <Text style={styles.actionsLabel}>Update Status</Text>

          <View style={styles.actions}>
            {ADMIN_ORDER_STATUSES.map((status) => {
              const isActive = order.status === status;

              return (
                <Pressable
                  key={status}
                  style={[
                    styles.actionChip,
                    isActive && styles.actionChipActive,
                    updating && styles.actionChipDisabled,
                  ]}
                  disabled={isActive || updating}
                  onPress={() => onUpdateStatus(order.id, status)}
                >
                  <Text
                    style={[
                      styles.actionChipText,
                      isActive && styles.actionChipTextActive,
                    ]}
                  >
                    {getOrderStatusLabel(status)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 4,
  },
  customerMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: "#f3e4e8",
    marginTop: 14,
    paddingTop: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
  },
  value: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  total: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  actionsWrap: {
    marginTop: 16,
  },
  actionsLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionChip: {
    borderRadius: 999,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  actionChipActive: {
    backgroundColor: "#111827",
  },
  actionChipDisabled: {
    opacity: 0.7,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  actionChipTextActive: {
    color: "#ffffff",
  },
});
