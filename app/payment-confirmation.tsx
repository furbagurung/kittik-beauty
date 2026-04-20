import { verifyPayment } from "@/services/payments/paymentClient";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { usePaymentSessionStore } from "@/store/paymentSessionStore";
import { getPaymentLabel } from "@/utils/payment";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import type { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";

type CallbackPayload = {
  status: string;
  orderId: string;
  transactionUuid: string;
  data: string;
};

const ESEWA_WEB_CALLBACK_HOST = "developer.esewa.com.np";

function getStringParam(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return "";
}

function isPaymentCallbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.pathname.includes("payment-confirmation") ||
      (parsed.host === ESEWA_WEB_CALLBACK_HOST &&
        (parsed.pathname === "/success" || parsed.pathname === "/failure"))
    );
  } catch {
    return (
      url.includes("payment-confirmation") ||
      url.includes(`${ESEWA_WEB_CALLBACK_HOST}/success`) ||
      url.includes(`${ESEWA_WEB_CALLBACK_HOST}/failure`)
    );
  }
}

function parseCallbackUrl(url: string): CallbackPayload {
  try {
    const parsed = new URL(url);
    const inferredStatus =
      parsed.pathname === "/success"
        ? "success"
        : parsed.pathname === "/failure"
          ? "failure"
          : "";

    return {
      status:
        parsed.searchParams.get("status")?.toLowerCase() || inferredStatus,
      orderId: parsed.searchParams.get("orderId") || "",
      transactionUuid: parsed.searchParams.get("transaction_uuid") || "",
      data: parsed.searchParams.get("data") || "",
    };
  } catch {
    return {
      status: "",
      orderId: "",
      transactionUuid: "",
      data: "",
    };
  }
}

function isEsewaGatewayUrl(url: string): boolean {
  return (
    url.includes("rc-epay.esewa.com.np") ||
    url.includes("epay.esewa.com.np") ||
    url.includes("developer.esewa.com.np/success") ||
    url.includes("developer.esewa.com.np/failure")
  );
}
export default function PaymentConfirmationScreen() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const payload = usePaymentSessionStore((state) => state.payload);
  const clearPayload = usePaymentSessionStore((state) => state.clearPayload);
  const clearCart = useCartStore((state) => state.clearCart);
  const handledCallbackRef = useRef(false);
  const { status, orderId, transaction_uuid, data } = useLocalSearchParams<{
    status?: string | string[];
    orderId?: string | string[];
    transaction_uuid?: string | string[];
    data?: string | string[];
  }>();
  const [callbackData, setCallbackData] = useState<CallbackPayload | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);
  const [hasGatewayLoaded, setHasGatewayLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value);

  const routeCallback = useMemo(() => {
    const callbackStatus = getStringParam(status).toLowerCase();

    if (!callbackStatus) {
      return null;
    }

    return {
      status: callbackStatus,
      orderId: getStringParam(orderId),
      transactionUuid: getStringParam(transaction_uuid),
      data: getStringParam(data),
    };
  }, [data, orderId, status, transaction_uuid]);

  useEffect(() => {
    if (routeCallback) {
      setCallbackData(routeCallback);
    }
  }, [routeCallback]);

  const handleCancel = useCallback(() => {
    clearPayload();
    router.back();
  }, [clearPayload]);

  const completeVerifiedPayment = useCallback(
    async (
      resolvedOrderId: string,
      providerReference?: string,
      callbackPayload?: CallbackPayload,
    ) => {
      if (!payload || !token) {
        throw new Error("Missing payment session");
      }

      const verification = await verifyPayment({
        method: payload.method,
        orderId: resolvedOrderId,
        token,
        paymentId: payload.paymentId,
        providerReference: providerReference || payload.providerReference,
        data: callbackPayload?.data,
      });

      if (!verification.success || verification.status !== "paid") {
        throw new Error(verification.message || "Payment verification failed");
      }

      clearCart();
      clearPayload();
      router.replace({
        pathname: "/order-success",
        params: { orderId: resolvedOrderId },
      });
    },
    [clearCart, clearPayload, payload, token],
  );

  useEffect(() => {
    if (!callbackData || handledCallbackRef.current || !payload || !token) {
      return;
    }

    const currentPayload = payload;
    const currentCallback = callbackData;
    handledCallbackRef.current = true;

    async function handleCallback() {
      setIsProcessing(true);
      setErrorMessage("");

      try {
        console.log("ESEWA CALLBACK DATA:", currentCallback);
        if (currentCallback.status !== "success") {
          setStatusMessage("Payment failed");
          setErrorMessage(
            "eSewa returned a failure response before verification. Please try again.",
          );
          return;
        }

        setStatusMessage("Verifying payment...");
        await completeVerifiedPayment(
          currentCallback.orderId || currentPayload.orderId,
          currentCallback.transactionUuid || currentPayload.providerReference,
          currentCallback,
        );
      } catch (error) {
        setStatusMessage("");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to complete eSewa payment.",
        );
      } finally {
        setIsProcessing(false);
      }
    }

    void handleCallback();
  }, [callbackData, completeVerifiedPayment, payload, token]);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      console.log("ESEWA WEBVIEW URL:", request.url);

      if (isPaymentCallbackUrl(request.url)) {
        const parsed = parseCallbackUrl(request.url);
        console.log("ESEWA CALLBACK PARSED:", parsed);
        setCallbackData(parsed);
        return false;
      }

      return true;
    },
    [],
  );

  if (!payload) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stateWrap}>
          <View style={styles.iconWrap}>
            <Ionicons name="wallet-outline" size={28} color="#DC2626" />
          </View>

          <Text style={styles.title}>No payment session found</Text>
          <Text style={styles.subtitle}>
            Start again from checkout to continue with online payment.
          </Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace("/checkout")}
          >
            <Text style={styles.primaryBtnText}>Back to Checkout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!user || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.stateWrap}>
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed-outline" size={28} color="#DC2626" />
          </View>

          <Text style={styles.title}>Login required</Text>
          <Text style={styles.subtitle}>
            Please log in to continue with payment confirmation.
          </Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace("/login")}
          >
            <Text style={styles.primaryBtnText}>Login to Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  const shouldShowBlockingOverlay =
    (!hasGatewayLoaded && isWebViewLoading) || isProcessing || !!errorMessage;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </Pressable>

        <Text style={styles.headerTitle}>
          {getPaymentLabel(payload.method)}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryLabel}>Order {payload.orderId}</Text>
          <Text style={styles.summaryValue}>{formatPrice(payload.amount)}</Text>
        </View>

        <View style={styles.summaryPill}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#DC2626" />
          <Text style={styles.summaryPillText}>In-App Checkout</Text>
        </View>
      </View>

      {payload.redirectUrl ? (
        <View style={styles.webViewWrap}>
          <WebView
            source={{ uri: payload.redirectUrl }}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onNavigationStateChange={(navState) => {
              if (isEsewaGatewayUrl(navState.url)) {
                setHasGatewayLoaded(true);
                setIsWebViewLoading(false);

                if (!callbackData && !isProcessing) {
                  setStatusMessage("Complete payment in the window below.");
                }
              }
            }}
            onLoadStart={({ nativeEvent }) => {
              if (!hasGatewayLoaded) {
                setIsWebViewLoading(true);
                setStatusMessage("Opening eSewa...");
              }

              if (isEsewaGatewayUrl(nativeEvent.url)) {
                setHasGatewayLoaded(true);
              }
            }}
            onLoadEnd={({ nativeEvent }) => {
              if (isEsewaGatewayUrl(nativeEvent.url)) {
                setHasGatewayLoaded(true);
                setIsWebViewLoading(false);

                if (!callbackData && !isProcessing) {
                  setStatusMessage("Complete payment in the window below.");
                }
              } else if (!hasGatewayLoaded) {
                setIsWebViewLoading(false);
              }
            }}
            onError={() => {
              setIsWebViewLoading(false);
              setStatusMessage("");
              setErrorMessage("Failed to load the eSewa payment page.");
            }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            setSupportMultipleWindows={false}
            thirdPartyCookiesEnabled
            style={styles.webView}
          />

          {shouldShowBlockingOverlay && (
            <View style={styles.overlay}>
              {isWebViewLoading || isProcessing ? (
                <ActivityIndicator
                  color="#DC2626"
                  style={styles.overlaySpinner}
                />
              ) : null}
              <Text style={styles.overlayTitle}>
                {statusMessage || "Preparing payment"}
              </Text>
              <Text style={styles.overlayText}>
                {errorMessage ||
                  "The eSewa payment page is being loaded inside the app."}
              </Text>

              {errorMessage ? (
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => {
                    handledCallbackRef.current = false;
                    setCallbackData(null);
                    setErrorMessage("");
                    setStatusMessage("Opening eSewa...");
                    setHasGatewayLoaded(false);
                    setIsWebViewLoading(true);
                  }}
                >
                  <Text style={styles.primaryBtnText}>Try Again</Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.stateWrap}>
          <Text style={styles.title}>Missing payment URL</Text>
          <Text style={styles.subtitle}>
            The backend did not return a valid eSewa redirect URL.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF2F2",
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEF2F2",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },
  summaryBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#FEF2F2",
    borderBottomWidth: 1,
    borderBottomColor: "#FECACA",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  summaryPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  webViewWrap: {
    flex: 1,
    position: "relative",
    backgroundColor: "#ffffff",
  },
  webView: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: "rgba(255,247,248,0.96)",
  },
  overlaySpinner: {
    marginBottom: 14,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  overlayText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 18,
  },
  stateWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
