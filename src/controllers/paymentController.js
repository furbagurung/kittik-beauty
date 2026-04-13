import crypto from "crypto";
import { Buffer } from "node:buffer";
import { prisma } from "../config/prisma.js";

const ESEWA_FORM_URL =
  process.env.ESEWA_FORM_URL ||
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_STATUS_CHECK_URL =
  process.env.ESEWA_STATUS_CHECK_URL ||
  "https://rc.esewa.com.np/api/epay/transaction/status/";
const ESEWA_APP_REDIRECT_URL =
  process.env.ESEWA_APP_REDIRECT_URL ||
  "kittikbeauty://payment-confirmation";
const ESEWA_WEB_SUCCESS_URL =
  process.env.ESEWA_WEB_SUCCESS_URL || "https://developer.esewa.com.np/success";
const ESEWA_WEB_FAILURE_URL =
  process.env.ESEWA_WEB_FAILURE_URL || "https://developer.esewa.com.np/failure";
const pendingEsewaSessions = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildAppRedirectUrl(
  baseRedirectUrl,
  status,
  orderId,
  transactionUuid,
) {
  const redirectUrl = new URL(baseRedirectUrl || ESEWA_APP_REDIRECT_URL);

  redirectUrl.searchParams.set("status", status);
  redirectUrl.searchParams.set("orderId", String(orderId));
  redirectUrl.searchParams.set("transaction_uuid", transactionUuid);

  return redirectUrl.toString();
}

function getRequestOrigin(req) {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");

  return `${protocol}://${host}`;
}

function buildEsewaWebReturnUrl(baseUrl, status, orderId, transactionUuid) {
  const redirectUrl = new URL(baseUrl);

  redirectUrl.searchParams.set("status", status);
  redirectUrl.searchParams.set("orderId", String(orderId));
  redirectUrl.searchParams.set("transaction_uuid", transactionUuid);

  return redirectUrl.toString();
}

function createEsewaSignature(message) {
  return crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");
}

function normalizeAmount(value) {
  return Number(Number(value).toFixed(2));
}

function buildSignedMessage(payload, signedFieldNames) {
  return String(signedFieldNames)
    .split(",")
    .map((fieldName) => fieldName.trim())
    .filter(Boolean)
    .map((fieldName) => `${fieldName}=${payload[fieldName] ?? ""}`)
    .join(",");
}

function signaturesMatch(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function decodeEsewaCallbackData(encodedData) {
  if (!encodedData) {
    return null;
  }

  try {
    const normalizedData = String(encodedData).replaceAll(" ", "+");
    const decodedJson = Buffer.from(normalizedData, "base64").toString("utf8");
    const parsed = JSON.parse(decodedJson);

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function verifyEsewaResponseSignature(payload) {
  const signedFieldNames = String(payload?.signed_field_names || "");
  const receivedSignature = String(payload?.signature || "");

  if (!signedFieldNames || !receivedSignature) {
    return false;
  }

  const expectedSignature = createEsewaSignature(
    buildSignedMessage(payload, signedFieldNames),
  );

  return signaturesMatch(expectedSignature, receivedSignature);
}

function normalizeEsewaStatusResponse(payload) {
  return {
    status: String(payload?.status || "").toUpperCase(),
    productCode: String(payload?.product_code ?? payload?.scd ?? ""),
    transactionUuid: String(payload?.transaction_uuid ?? payload?.pid ?? ""),
    totalAmount: Number(payload?.total_amount ?? payload?.totalAmount ?? NaN),
    referenceId: String(payload?.ref_id ?? payload?.refId ?? ""),
  };
}

function buildEsewaSignature(totalAmount, transactionUuid) {
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = createEsewaSignature(message);

  return { signature, signedFieldNames };
}

async function fetchEsewaStatus(totalAmount, transactionUuid) {
  const verifyUrl = new URL(ESEWA_STATUS_CHECK_URL);

  verifyUrl.searchParams.set("product_code", ESEWA_PRODUCT_CODE);
  verifyUrl.searchParams.set("total_amount", String(totalAmount));
  verifyUrl.searchParams.set("transaction_uuid", transactionUuid);

  const response = await fetch(verifyUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`eSewa status check failed with status ${response.status}`);
  }

  return normalizeEsewaStatusResponse(await response.json());
}

export async function initiateEsewaPayment(req, res) {
  try {
    const { orderId, amount, customerName, phone, returnUrl } = req.body;
    const parsedOrderId = Number(orderId);
    const parsedAmount = Number(amount);

    if (
      !Number.isInteger(parsedOrderId) ||
      !customerName ||
      !phone ||
      !Number.isFinite(parsedAmount)
    ) {
      return res.status(400).json({
        success: false,
        message: "orderId, amount, customerName, and phone are required",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parsedOrderId,
        userId: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentMethod !== "esewa") {
      return res.status(400).json({
        success: false,
        message: "Order is not configured for eSewa payment",
      });
    }

    if (order.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    if (normalizeAmount(order.total) !== normalizeAmount(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match the order total",
      });
    }

    const normalizedOrderId = String(orderId).replace(/[^a-zA-Z0-9-]/g, "-");
    const transactionUuid = `${normalizedOrderId}-${Date.now()}`;
    const totalAmount = String(parsedAmount);
    const { signature, signedFieldNames } = buildEsewaSignature(
      totalAmount,
      transactionUuid,
    );
    const origin = getRequestOrigin(req);
    const appRedirectUrl = new URL(
      returnUrl || ESEWA_APP_REDIRECT_URL,
    ).toString();
    const successUrl = new URL(
      `/api/payments/esewa/callback/${encodeURIComponent(transactionUuid)}?status=success`,
      origin,
    ).toString();
    const failureUrl = new URL(
      `/api/payments/esewa/callback/${encodeURIComponent(transactionUuid)}?status=failure`,
      origin,
    ).toString();
    const formFields = {
      amount: totalAmount,
      tax_amount: "0",
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    };

    pendingEsewaSessions.set(transactionUuid, {
      appRedirectUrl,
      formFields,
      orderId: String(orderId),
    });

    const redirectUrl = new URL(
      `/api/payments/esewa/redirect/${encodeURIComponent(transactionUuid)}`,
      origin,
    ).toString();

    return res.json({
      success: true,
      message: "eSewa initiate route is working",
      transaction_uuid: transactionUuid,
      amount: parsedAmount,
      customerName,
      phone,
      redirectUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to initiate eSewa payment",
      error: error.message,
    });
  }
}

export async function renderEsewaPaymentPage(req, res) {
  const { transactionUuid } = req.params;
  const session = pendingEsewaSessions.get(transactionUuid);
  const formFields = session?.formFields;

  if (!formFields) {
    return res.status(404).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Payment session not found</h2>
          <p>The eSewa payment session is missing or expired.</p>
        </body>
      </html>
    `);
  }

  const inputs = Object.entries(formFields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
    )
    .join("\n");

  return res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <title>Redirecting to eSewa</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: Arial, sans-serif;
            background: #fff7f8;
            color: #111827;
          }
          .card {
            width: min(92vw, 420px);
            background: #ffffff;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 12px 32px rgba(17, 24, 39, 0.08);
            text-align: center;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 24px;
          }
          p {
            margin: 0 0 18px;
            color: #6b7280;
            line-height: 1.5;
          }
          button {
            border: 0;
            border-radius: 999px;
            padding: 14px 22px;
            background: #d96c8a;
            color: #ffffff;
            font-weight: 700;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Redirecting to eSewa</h1>
          <p>Your payment page is opening. If it does not continue automatically, use the button below.</p>
          <form id="esewa-form" action="${escapeHtml(ESEWA_FORM_URL)}" method="POST">
            ${inputs}
            <button type="submit">Continue to eSewa</button>
          </form>
        </div>
        <script>
          window.addEventListener("load", function () {
            document.getElementById("esewa-form").submit();
          });
        </script>
      </body>
    </html>
  `);
}

export async function handleEsewaCallback(req, res) {
  console.log("ESEWA CALLBACK HIT", {
    method: req.method,
    originalUrl: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      referer: req.get("referer"),
      userAgent: req.get("user-agent"),
      contentType: req.get("content-type"),
    },
  });
  const { transactionUuid } = req.params;
  const session = pendingEsewaSessions.get(transactionUuid);
  if (typeof req.query.reason === "string" && req.query.reason) {
    const appRedirect = new URL(appRedirectUrl);
    appRedirect.searchParams.set("reason", req.query.reason);
    appRedirectUrl = appRedirect.toString();
  }

  if (typeof req.query.message === "string" && req.query.message) {
    const appRedirect = new URL(appRedirectUrl);
    appRedirect.searchParams.set("message", req.query.message);
    appRedirectUrl = appRedirect.toString();
  }
  if (!session) {
    return res.status(404).send(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Payment session not found</h2>
          <p>The eSewa callback could not be matched to an existing session.</p>
        </body>
      </html>
    `);
  }

  const requestedStatus = String(req.query.status || "").toLowerCase();
  const normalizedStatus =
    requestedStatus === "success" ? "success" : "failure";
  let appRedirectUrl = buildAppRedirectUrl(
    session.appRedirectUrl,
    normalizedStatus,
    session.orderId,
    transactionUuid,
  );
  if (typeof req.query.data === "string" && req.query.data) {
    const appRedirect = new URL(appRedirectUrl);
    appRedirect.searchParams.set("data", req.query.data);
    appRedirectUrl = appRedirect.toString();
  }
  const title =
    normalizedStatus === "success"
      ? "Returning to Kittik Beauty"
      : "Payment update ready";
  const message =
    normalizedStatus === "success"
      ? "Your payment is complete. If the app does not resume automatically, use the button below."
      : "Your payment did not complete successfully. Return to the app to review the result.";

  return res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            font-family: Arial, sans-serif;
            background: #fff7f8;
            color: #111827;
          }
          .card {
            width: min(92vw, 420px);
            background: #ffffff;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 12px 32px rgba(17, 24, 39, 0.08);
            text-align: center;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 24px;
          }
          p {
            margin: 0 0 18px;
            color: #6b7280;
            line-height: 1.5;
          }
          a {
            display: inline-block;
            border-radius: 999px;
            padding: 14px 22px;
            background: #d96c8a;
            color: #ffffff;
            font-weight: 700;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(message)}</p>
          <a href="${escapeHtml(appRedirectUrl)}">Return to App</a>
        </div>
        <script>
          window.addEventListener("load", function () {
            window.location.replace(${JSON.stringify(appRedirectUrl)});
          });
        </script>
      </body>
    </html>
  `);
}

export async function verifyEsewaPayment(req, res) {
  try {
    console.log("ESEWA VERIFY REQUEST", {
      body: req.body,
      userId: req.user?.id,
    });
    const parsedOrderId = Number(req.body.orderId);
    const providerReference = String(req.body.providerReference || "");
    const callbackData = String(req.body.data || "");

    if (!Number.isInteger(parsedOrderId)) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "A valid orderId is required",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parsedOrderId,
        userId: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        status: "FAILED",
        message: "Order not found",
      });
    }

    if (order.paymentMethod !== "esewa") {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "Order is not associated with eSewa",
      });
    }

    if (order.status === "paid") {
      return res.json({
        success: true,
        status: "COMPLETE",
        message: "Payment already verified",
      });
    }

    const decodedPayload = decodeEsewaCallbackData(callbackData);
    console.log("ESEWA DECODED PAYLOAD", decodedPayload);
    if (callbackData && !decodedPayload) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "Invalid eSewa callback payload",
      });
    }

    if (decodedPayload && !verifyEsewaResponseSignature(decodedPayload)) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "eSewa callback signature verification failed",
      });
    }

    if (
      decodedPayload &&
      normalizeAmount(decodedPayload.total_amount) !==
        normalizeAmount(order.total)
    ) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "eSewa callback amount does not match the order total",
      });
    }

    if (
      decodedPayload &&
      String(decodedPayload.product_code || "") !== ESEWA_PRODUCT_CODE
    ) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "eSewa callback product code is invalid",
      });
    }

    const transactionUuid =
      String(decodedPayload?.transaction_uuid || "") || providerReference;

    if (
      decodedPayload &&
      providerReference &&
      String(decodedPayload.transaction_uuid || "") !== providerReference
    ) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "eSewa callback transaction reference mismatch",
      });
    }

    if (!transactionUuid) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "Missing eSewa transaction reference",
      });
    }

    if (
      decodedPayload &&
      String(decodedPayload.status || "").toUpperCase() !== "COMPLETE"
    ) {
      return res.json({
        success: false,
        status: String(decodedPayload.status || "FAILED").toUpperCase(),
        message: "eSewa reports that the payment is not complete",
      });
    }

    const statusResult = await fetchEsewaStatus(order.total, transactionUuid);

    if (
      statusResult.productCode &&
      statusResult.productCode !== ESEWA_PRODUCT_CODE
    ) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "eSewa status check product code mismatch",
      });
    }

    if (
      statusResult.transactionUuid &&
      statusResult.transactionUuid !== transactionUuid
    ) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "eSewa status check transaction mismatch",
      });
    }

    if (
      Number.isFinite(statusResult.totalAmount) &&
      normalizeAmount(statusResult.totalAmount) !== normalizeAmount(order.total)
    ) {
      return res.status(400).json({
        success: false,
        status: "FAILED",
        message: "eSewa status check amount mismatch",
      });
    }

    if (statusResult.status !== "COMPLETE") {
      return res.json({
        success: false,
        status: statusResult.status || "FAILED",
        message: "eSewa payment is not complete yet",
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });

    pendingEsewaSessions.delete(transactionUuid);

    return res.json({
      success: true,
      status: "COMPLETE",
      message: "eSewa payment verified successfully",
      referenceId: statusResult.referenceId || undefined,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify eSewa payment",
      error: error.message,
    });
  }
}
