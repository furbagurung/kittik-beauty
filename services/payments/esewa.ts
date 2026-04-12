import type {
    InitiatePaymentInput,
    InitiatePaymentResult,
    VerifyPaymentInput,
    VerifyPaymentResult,
} from "./paymentTypes";

export async function initiateEsewaPayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  return {
    success: true,
    method: "esewa",
    paymentId: `ESEWA-${Date.now()}`,
    providerReference: input.orderId,
    message: "eSewa payment initiation placeholder",
  };
}

export async function verifyEsewaPayment(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
  return {
    success: true,
    status: "paid",
    message: `eSewa verification placeholder for ${input.orderId}`,
  };
}
