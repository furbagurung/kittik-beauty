import type { AdminCustomerSummary } from "@/types/admin";
import {
  formatAdminCurrency,
  formatAdminDate,
} from "@/utils/adminFormatters";
import { StyleSheet, Text, View } from "react-native";

type AdminCustomerCardProps = {
  customer: AdminCustomerSummary;
};

export default function AdminCustomerCard({
  customer,
}: AdminCustomerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.email}>{customer.email}</Text>
        </View>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{customer.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Orders</Text>
          <Text style={styles.metricValue}>{customer.orderCount}</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Lifetime Spend</Text>
          <Text style={styles.metricValue}>
            {formatAdminCurrency(customer.totalSpent)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Joined {formatAdminDate(customer.createdAt)}
        </Text>
        <Text style={styles.footerText}>
          Last order {formatAdminDate(customer.lastOrderAt)}
        </Text>
      </View>
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
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: "#6b7280",
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  metrics: {
    flexDirection: "row",
    gap: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 14,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  footer: {
    marginTop: 14,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
