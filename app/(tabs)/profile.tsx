import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff7f8" },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
});
