import type { OrderStatus } from "@/types/order";
import { getOrderStatusMeta } from "@/utils/adminFormatters";
import { StyleSheet, Text, View } from "react-native";

type AdminStatusChipProps = {
  status: OrderStatus;
};

export default function AdminStatusChip({ status }: AdminStatusChipProps) {
  const meta = getOrderStatusMeta(status);

  return (
    <View style={[styles.chip, { backgroundColor: meta.backgroundColor }]}>
      <Text style={[styles.text, { color: meta.textColor }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
