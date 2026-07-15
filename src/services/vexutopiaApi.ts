// Vexutopia Payment API Client
// API Docs: https://vexutopia.com/docs/payments
const VEX_BASE_URL = "https://vexutopia.com/api/v1";

export interface CreatePaymentRequest {
  amount: string;
  currency: string;
  return_url: string;
  webhook_url?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentResponse {
  id: string;
  checkout_url: string;
  status?: string;
}

export interface PaymentStatus {
  id: string;
  status: "pending" | "completed" | "failed" | "refunded";
  amount: string;
  currency: string;
  payment_method?: string;
  processor?: string;
  failure_code?: string;
  failure_reason?: string;
  metadata?: Record<string, string>;
}

export interface WebhookPayload {
  event: "payment.completed" | "payment.failed" | "payment.refunded";
  id: string;
  payment_id: string;
  order_id: string;
  status: string;
  amount: string;
  currency: string;
  payment_method?: string;
  processor?: string;
  livemode: boolean;
  timestamp: string;
  failure_code?: string;
  failure_reason?: string;
  metadata?: Record<string, string>;
}

export async function createPayment(
  apiKey: string,
  request: CreatePaymentRequest
): Promise<CreatePaymentResponse> {
  const response = await fetch(`${VEX_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function getPayment(
  apiKey: string,
  paymentId: string
): Promise<PaymentStatus> {
  const response = await fetch(`${VEX_BASE_URL}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export function verifyWebhookSignature(
  secret: string,
  header: string,
  rawBody: string
): boolean {
  try {
    const crypto = require("crypto");

    const parts: Record<string, string> = {};
    header.split(",").forEach((part) => {
      const [key, value] = part.trim().split("=");
      if (key && value) parts[key] = value;
    });

    const t = parts["t"];
    const v1 = parts["v1"];

    if (!t || !v1) return false;

    const ageSec = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
    if (!Number.isFinite(ageSec) || ageSec > 300) return false;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${t}.${rawBody}`)
      .digest("hex");

    return (
      expected.length === v1.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
    );
  } catch {
    return false;
  }
}