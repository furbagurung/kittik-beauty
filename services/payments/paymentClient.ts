import { initiateEsewaPayment, verifyEsewaPayment } from "./esewa";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "./khalti";
import type {
    InitiatePaymentInput,
    InitiatePaymentResult,
    VerifyPaymentInput,
    VerifyPaymentResult,
} from "./paymentTypes";

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  if (input.method === "esewa") {
    return initiateEsewaPayment(input);
  }

  if (input.method === "khalti") {
    return initiateKhaltiPayment(input);
  }

  return {
    success: false,
    method: input.method,
    message: "Unsupported online payment method",
  };
}

export async function verifyPayment(
  input: VerifyPaymentInput,
): Promise<VerifyPaymentResult> {
  if (input.method === "esewa") {
    return verifyEsewaPayment(input);
  }

  if (input.method === "khalti") {
    return verifyKhaltiPayment(input);
  }

  return {
    success: false,
    status: "failed",
    message: "Unsupported payment verification method",
  };
}
