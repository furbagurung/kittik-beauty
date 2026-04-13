import crypto from "crypto";

const ESEWA_FORM_URL =
  process.env.ESEWA_FORM_URL ||
  "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY =
  process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_APP_REDIRECT_URL =
  process.env.ESEWA_APP_REDIRECT_URL || "kittikbeauty://payment-confirmation";
const pendingEsewaSessions = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildAppRedirectUrl(baseRedirectUrl, status, orderId, transactionUuid) {
  const redirectUrl = new URL(baseRedirectUrl || ESEWA_APP_REDIRECT_URL);

  redirectUrl.searchParams.set("status", status);
  redirectUrl.searchParams.set("orderId", String(orderId));
  redirectUrl.searchParams.set("transaction_uuid", transactionUuid);

  return redirectUrl.toString();
}

function buildEsewaSignature(totalAmount, transactionUuid) {
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;
  const signature = crypto
    .createHmac("sha256", ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");

  return { signature, signedFieldNames };
}

export async function initiateEsewaPayment(req, res) {
  try {
    const { orderId, amount, customerName, phone, returnUrl } = req.body;
    const parsedAmount = Number(amount);

    if (!orderId || !customerName || !phone || !Number.isFinite(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: "orderId, amount, customerName, and phone are required",
      });
    }

    const normalizedOrderId = String(orderId).replace(/[^a-zA-Z0-9-]/g, "-");
    const transactionUuid = `${normalizedOrderId}-${Date.now()}`;
    const totalAmount = String(parsedAmount);
    const { signature, signedFieldNames } = buildEsewaSignature(
      totalAmount,
      transactionUuid,
    );
    const successUrl = buildAppRedirectUrl(
      returnUrl,
      "success",
      orderId,
      transactionUuid,
    );
    const failureUrl = buildAppRedirectUrl(
      returnUrl,
      "failure",
      orderId,
      transactionUuid,
    );
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

    pendingEsewaSessions.set(transactionUuid, formFields);

    const redirectUrl = `${req.protocol}://${req.get("host")}/api/payments/esewa/redirect/${encodeURIComponent(transactionUuid)}`;

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
  const formFields = pendingEsewaSessions.get(transactionUuid);

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

export async function verifyEsewaPayment(_req, res) {
  try {
    return res.json({
      success: true,
      status: "COMPLETE",
      message: "eSewa verify route is working",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify eSewa payment",
      error: error.message,
    });
  }
}
