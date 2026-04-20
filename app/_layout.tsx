import {
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AppColors } from "@/constants/theme";

export const unstable_settings = {
  anchor: "(tabs)",
};

const APP_LIGHT_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppColors.primary,
    background: AppColors.background,
    card: AppColors.background,
    text: AppColors.textPrimary,
    border: AppColors.border,
    notification: AppColors.primary,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={APP_LIGHT_THEME}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ title: "Cart" }} />
        <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="orders" options={{ title: "Orders" }} />
        <Stack.Screen name="order/[id]" options={{ title: "Order Details" }} />
        <Stack.Screen name="products" options={{ title: "All Products" }} />

        <Stack.Screen
          name="order-success"
          options={{ title: "Order Success" }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{ title: "Product Details" }}
        />
        <Stack.Screen
          name="payment-confirmation"
          options={{ title: "Payment Confirmation" }}
        />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
