import type {
    InitiatePaymentInput,
    InitiatePaymentResult,
    VerifyPaymentInput,
    VerifyPaymentResult,
} from "./paymentTypes";

export async function initiateKhaltiPayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  return {
    success: true,
    method: "khalti",
    paymentId: `KHALTI-${Date.now()}`,
    providerReference: input.orderId,
    message: "Khalti payment initiation placeholder",
  };
}

export async function verifyKhaltiPayment(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
  return {
    success: true,
    status: "paid",
    message: `Khalti verification placeholder for ${input.orderId}`,
  };
}
