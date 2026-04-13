import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="admin/index" options={{ title: "Admin Panel" }} />
        <Stack.Screen name="auth/login" options={{ title: "Login" }} />
        <Stack.Screen name="auth/signup" options={{ title: "Sign Up" }} />
        <Stack.Screen name="shop/cart" options={{ title: "Cart" }} />
        <Stack.Screen name="shop/checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="shop/orders" options={{ title: "Orders" }} />
        <Stack.Screen name="order/[id]" options={{ title: "Order Details" }} />
        <Stack.Screen
          name="shop/products"
          options={{ title: "All Products" }}
        />

        <Stack.Screen
          name="order-success"
          options={{ title: "Order Success" }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{ title: "Product Details" }}
        />
        <Stack.Screen
          name="shop/payment-confirmation"
          options={{ title: "Payment Confirmation" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
