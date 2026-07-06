import { ENV } from "./env.js";

const PAYPAL_BASE_URL =
  ENV.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

function ensurePaypalConfig() {
  if (!ENV.PAYPAL_CLIENT_ID || !ENV.PAYPAL_CLIENT_SECRET) {
    const error = new Error("PayPal Sandbox is not configured");
    error.status = 500;
    throw error;
  }
}

async function getAccessToken() {
  ensurePaypalConfig();

  const credentials = Buffer.from(
    `${ENV.PAYPAL_CLIENT_ID}:${ENV.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "Could not authenticate PayPal");
    error.status = response.status;
    throw error;
  }

  return data.access_token;
}

export async function createPaypalOrder({ planKey, plan }) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: planKey,
          description: `${plan.name} plan`,
          custom_id: planKey,
          amount: {
            currency_code: "USD",
            value: Number(plan.price).toFixed(2),
          },
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "Could not create PayPal order");
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function capturePaypalOrder(orderId) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "Could not capture PayPal order");
    error.status = response.status;
    throw error;
  }

  return data;
}
