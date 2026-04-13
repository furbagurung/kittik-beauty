import { api } from "@/services/api";
import * as Linking from "expo-linking";
import type {
  InitiatePaymentInput,
  InitiatePaymentResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "./paymentTypes";

export async function initiateEsewaPayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  try {
    const returnUrl = Linking.createURL("payment-confirmation");

    const data = await api.initiateEsewaPayment({
      orderId: input.orderId,
      amount: input.amount,
      customerName: input.customerName,
      phone: input.phone,
      returnUrl,
    }, input.token);

    return {
      success: true,
      method: "esewa",
      paymentId: data?.transaction_uuid || `ESEWA-${Date.now()}`,
      redirectUrl: data?.redirectUrl,
      providerReference: data?.transaction_uuid || String(input.orderId),
      message: data?.message || "eSewa payment initiated successfully",
    };
  } catch (error) {
    return {
      success: false,
      method: "esewa",
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to eSewa payment service",
    };
  }
}

export async function verifyEsewaPayment(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
  try {
    const data = await api.verifyEsewaPayment({
      orderId: input.orderId,
      paymentId: input.paymentId,
      providerReference: input.providerReference,
      data: input.data,
    }, input.token);

    const providerStatus = String(data?.status || "").toUpperCase();

    const normalizedStatus =
      providerStatus === "COMPLETE"
        ? "paid"
        : providerStatus === "PENDING" || providerStatus === "AMBIGUOUS"
          ? "pending"
          : "failed";

    return {
      success: normalizedStatus === "paid",
      status: normalizedStatus,
      message: data?.message || "eSewa payment verification completed",
    };
  } catch (error) {
    return {
      success: false,
      status: "failed",
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify eSewa payment",
    };
  }
}
