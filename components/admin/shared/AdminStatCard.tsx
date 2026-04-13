import { StyleSheet, Text, View } from "react-native";

type AdminStatCardProps = {
  title: string;
  value: string;
  description: string;
  accent: string;
};

export default function AdminStatCard({
  title,
  value,
  description,
  accent,
}: AdminStatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  accent: {
    width: 34,
    height: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
  },
});
