import { ADMIN_SECTIONS } from "@/constants/admin";
import type { AdminSection } from "@/types/admin";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

type AdminSectionTabsProps = {
  value: AdminSection;
  onChange: (value: AdminSection) => void;
};

export default function AdminSectionTabs({
  value,
  onChange,
}: AdminSectionTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {ADMIN_SECTIONS.map((section) => {
        const isActive = value === section.key;

        return (
          <Pressable
            key={section.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(section.key)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {section.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 6,
  },
  tab: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  tabActive: {
    backgroundColor: "#111827",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  tabTextActive: {
    color: "#ffffff",
  },
});
