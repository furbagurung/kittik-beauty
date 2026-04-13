import type { AdminProductFormState } from "@/types/admin";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type FieldKey = keyof AdminProductFormState;

type AdminProductFormModalProps = {
  visible: boolean;
  mode: "create" | "edit";
  categories: readonly string[];
  form: AdminProductFormState;
  saving: boolean;
  onChange: (field: FieldKey, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: "default" | "numeric" | "url";
  onChangeText: (value: string) => void;
};

function Field({
  label,
  value,
  placeholder,
  keyboardType = "default",
  onChangeText,
}: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        style={styles.input}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export default function AdminProductFormModal({
  visible,
  mode,
  categories,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: AdminProductFormModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.title}>
                {mode === "create" ? "Add Product" : "Edit Product"}
              </Text>
              <Text style={styles.subtitle}>
                Keep catalog records complete so the admin panel stays easy to
                maintain.
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Field
              label="Product Name"
              value={form.name}
              placeholder="Glow Serum"
              onChangeText={(value) => onChange("name", value)}
            />

            <Field
              label="Image URL"
              value={form.image}
              placeholder="https://..."
              keyboardType="url"
              onChangeText={(value) => onChange("image", value)}
            />

            <View style={styles.row}>
              <View style={styles.rowField}>
                <Field
                  label="Price"
                  value={form.price}
                  placeholder="1299"
                  keyboardType="numeric"
                  onChangeText={(value) => onChange("price", value)}
                />
              </View>

              <View style={styles.rowField}>
                <Field
                  label="Rating"
                  value={form.rating}
                  placeholder="4.5"
                  keyboardType="numeric"
                  onChangeText={(value) => onChange("rating", value)}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>

              <View style={styles.categoryWrap}>
                {categories.map((category) => {
                  const isActive = form.category === category;

                  return (
                    <Pressable
                      key={category}
                      style={[
                        styles.categoryChip,
                        isActive && styles.categoryChipActive,
                      ]}
                      onPress={() => onChange("category", category)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isActive && styles.categoryChipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, saving && styles.primaryButtonDisabled]}
              onPress={onSubmit}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create Product"
                    : "Save Changes"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: "84%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6b7280",
    maxWidth: 260,
  },
  closeButton: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    borderRadius: 999,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: "#111827",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  primaryButton: {
    flex: 1.4,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
